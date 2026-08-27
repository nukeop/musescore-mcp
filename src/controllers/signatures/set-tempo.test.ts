import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { createScore } from "../../test/create-score";
import "../../test/matchers";
import { BunFsMock } from "../../test/mocks/bun-fs";
import { setTempo } from "../../test/set-tempo";
import { createTestClient, type TestClient } from "../../test/test-setup";

describe("set_tempo", () => {
	let mcp: TestClient;

	beforeEach(async () => {
		mcp = await createTestClient();
	});

	afterEach(async () => {
		BunFsMock.reset();
		await mcp.close();
	});

	test("(Snapshot) writes a tempo change to the first staff only", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano", "electric-bass"], measures: 4 });

		const result = await setTempo(mcp, "/scores/test-tune.mscx", { measure: 3, bpm: 80 });

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("(Snapshot) replaces an existing Tempo at the same bar instead of duplicating", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		const setup = await setTempo(mcp, "/scores/test-tune.mscx", { measure: 3, bpm: 80 });
		expect(setup.isError).toBeUndefined();

		const result = await setTempo(mcp, "/scores/test-tune.mscx", { measure: 3, bpm: 100 });

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("rejects a measure beyond the end of the score", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });

		const result = await setTempo(mcp, "/scores/test-tune.mscx", { measure: 6, bpm: 80 });

		expect(result).toBeToolError(
			"Measure 6 exceeds score length (4 measures): /scores/test-tune.mscx",
		);
	});
});
