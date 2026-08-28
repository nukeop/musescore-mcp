import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { createScore } from "../../test/create-score";
import "../../test/matchers";
import { BunFsMock } from "../../test/mocks/bun-fs";
import { setLayoutBreak } from "../../test/set-layout-break";
import { createTestClient, type TestClient } from "../../test/test-setup";

describe("set_layout_break", () => {
	let mcp: TestClient;

	beforeEach(async () => {
		mcp = await createTestClient();
	});

	afterEach(async () => {
		BunFsMock.reset();
		await mcp.close();
	});

	test("(Snapshot) writes a system break as subtype line, on the first staff only", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano", "trumpet"], measures: 4 });

		const result = await setLayoutBreak(mcp, "/scores/test-tune.mscx", { measure: 2, type: "system" });

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("(Snapshot) writes a page break", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });

		const result = await setLayoutBreak(mcp, "/scores/test-tune.mscx", { measure: 2, type: "page" });

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("(Snapshot) writes a section break", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });

		const result = await setLayoutBreak(mcp, "/scores/test-tune.mscx", { measure: 2, type: "section" });

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("(Snapshot) replaces an existing break at the same measure", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		const setup = await setLayoutBreak(mcp, "/scores/test-tune.mscx", { measure: 2, type: "system" });
		expect(setup.isError).toBeUndefined();

		const result = await setLayoutBreak(mcp, "/scores/test-tune.mscx", { measure: 2, type: "page" });

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("(Snapshot) none clears an existing break", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		const setup = await setLayoutBreak(mcp, "/scores/test-tune.mscx", { measure: 2, type: "page" });
		expect(setup.isError).toBeUndefined();

		const result = await setLayoutBreak(mcp, "/scores/test-tune.mscx", { measure: 2, type: "none" });

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("rejects a measure beyond the end of the score", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });

		const result = await setLayoutBreak(mcp, "/scores/test-tune.mscx", { measure: 6, type: "system" });

		expect(result).toBeToolError(
			"Measure 6 exceeds score length (4 measures): /scores/test-tune.mscx",
		);
	});
});
