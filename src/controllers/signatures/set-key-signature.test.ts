import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { createScore } from "../../test/create-score";
import "../../test/matchers";
import { BunFsMock } from "../../test/mocks/bun-fs";
import { setKeySignature } from "../../test/set-key-signature";
import { createTestClient, type TestClient } from "../../test/test-setup";

describe("set_key_signature", () => {
	let mcp: TestClient;

	beforeEach(async () => {
		mcp = await createTestClient();
	});

	afterEach(async () => {
		BunFsMock.reset();
		await mcp.close();
	});

	test("(Snapshot) writes a key change to all staves of a multi-staff score", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano", "trumpet"], measures: 4 });

		const result = await setKeySignature(mcp, "/scores/test-tune.mscx", { measure: 3, key: "D" });

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("(Snapshot) replaces an existing KeySig at the same bar", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		const setup = await setKeySignature(mcp, "/scores/test-tune.mscx", { measure: 2, key: "D" });
		expect(setup.isError).toBeUndefined();

		const result = await setKeySignature(mcp, "/scores/test-tune.mscx", { measure: 2, key: "B♭" });

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("rejects a measure beyond the end of the score", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });

		const result = await setKeySignature(mcp, "/scores/test-tune.mscx", { measure: 6, key: "D" });

		expect(result).toBeToolError(
			"Measure 6 exceeds score length (4 measures): /scores/test-tune.mscx",
		);
	});
});
