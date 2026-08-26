import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { createScore } from "../../test/create-score";
import { deleteMeasures } from "../../test/delete-measures";
import "../../test/matchers";
import { BunFsMock } from "../../test/mocks/bun-fs";
import { readMeasures } from "../../test/read-measures";
import { createTestClient, type TestClient } from "../../test/test-setup";
import { writeMeasures } from "../../test/write-measures";

describe("delete_measures", () => {
	let mcp: TestClient;

	beforeEach(async () => {
		mcp = await createTestClient();
	});

	afterEach(async () => {
		BunFsMock.reset();
		await mcp.close();
	});

	test("deletes a range of bars and shifts later bars down", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 16 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});
		await writeMeasures(mcp, "/scores/test-tune.mscx", {
			from: 1,
			content: "C4:1 | D4 | E4 | F4 | G4 | A4 | B4 | C5 | D5 | E5 | F5 | G5 | A5 | B5 | C6 | D6",
		});
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await deleteMeasures(mcp, "/scores/test-tune.mscx", { from: 5, to: 8 });

		expect(result.isError).toBeUndefined();

		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});
		const remaining = await readMeasures(mcp, "/scores/test-tune.mscx", { from: 1, to: 12 });
		expect(remaining).toBeToolText("C4:1 | D4 | E4 | F4 | D5 | E5 | F5 | G5 | A5 | B5 | C6 | D6");
		const beyond = await readMeasures(mcp, "/scores/test-tune.mscx", { from: 1, to: 13 });
		expect(beyond).toBeToolError(
			"Measure range 1-13 exceeds score length (12 measures): /scores/test-tune.mscx",
		);
	});

	test("rejects a deletion that would break a cross-bar tie", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});
		await writeMeasures(mcp, "/scores/test-tune.mscx", { from: 1, content: "C4:1 | C4~ | C4 | D4" });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await deleteMeasures(mcp, "/scores/test-tune.mscx", { from: 3, to: 4 });

		expect(result).toBeToolError("Deleting measures 3-4 would break a tie between measures 2 and 3");
	});

	test("rejects deleting every bar", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await deleteMeasures(mcp, "/scores/test-tune.mscx", { from: 1, to: 4 });

		expect(result).toBeToolError("Deleting measures 1-4 would leave the score empty");
	});

	test("rejects deleting a range beyond the score length", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await deleteMeasures(mcp, "/scores/test-tune.mscx", { from: 3, to: 6 });

		expect(result).toBeToolError(
			"Measure range 3-6 exceeds score length (4 measures): /scores/test-tune.mscx",
		);
	});
});
