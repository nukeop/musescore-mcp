import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { createScore } from "../../test/create-score";
import "../../test/matchers";
import { BunFsMock } from "../../test/mocks/bun-fs";
import { setSectionMarker } from "../../test/set-section-marker";
import { createTestClient, type TestClient } from "../../test/test-setup";
import { writeMeasures } from "../../test/write-measures";

describe("set_section_marker", () => {
	let mcp: TestClient;

	beforeEach(async () => {
		mcp = await createTestClient();
	});

	afterEach(async () => {
		BunFsMock.reset();
		await mcp.close();
	});

	test("(Snapshot) writes a rehearsal mark to the first staff only", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano", "trumpet"], measures: 4 });

		const result = await setSectionMarker(mcp, "/scores/test-tune.mscx", { measure: 2, text: "A" });

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("(Snapshot) replaces an existing mark at the same bar instead of duplicating", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		const setup = await setSectionMarker(mcp, "/scores/test-tune.mscx", { measure: 2, text: "A" });
		expect(setup.isError).toBeUndefined();

		const result = await setSectionMarker(mcp, "/scores/test-tune.mscx", { measure: 2, text: "Chorus" });

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("(Snapshot) keeps the mark when the bar's content is rewritten", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		const setup = await setSectionMarker(mcp, "/scores/test-tune.mscx", { measure: 2, text: "A" });
		expect(setup.isError).toBeUndefined();

		const result = await writeMeasures(mcp, "/scores/test-tune.mscx", { from: 2, content: "C4:1" });

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("rejects a measure beyond the end of the score", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });

		const result = await setSectionMarker(mcp, "/scores/test-tune.mscx", { measure: 6, text: "A" });

		expect(result).toBeToolError(
			"Measure 6 exceeds score length (4 measures): /scores/test-tune.mscx",
		);
	});
});
