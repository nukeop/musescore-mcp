import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { createScore } from "../../test/create-score";
import { insertMeasures } from "../../test/insert-measures";
import "../../test/matchers";
import { BunFsMock } from "../../test/mocks/bun-fs";
import { readMeasures } from "../../test/read-measures";
import { createTestClient, type TestClient } from "../../test/test-setup";
import { writeMeasures } from "../../test/write-measures";

describe("insert_measures", () => {
	let mcp: TestClient;

	beforeEach(async () => {
		mcp = await createTestClient();
	});

	afterEach(async () => {
		BunFsMock.reset();
		await mcp.close();
	});

	test("inserts empty bars in the middle and shifts later bars", async () => {
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

		const result = await insertMeasures(mcp, "/scores/test-tune.mscx", { at: 9, count: 4 });

		expect(result.isError).toBeUndefined();

		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});
		const before = await readMeasures(mcp, "/scores/test-tune.mscx", { from: 1, to: 8 });
		expect(before).toBeToolText("C4:1 | D4 | E4 | F4 | G4 | A4 | B4 | C5");
		const inserted = await readMeasures(mcp, "/scores/test-tune.mscx", { from: 9, to: 12 });
		expect(inserted).toBeToolText("R | R | R | R");
		const shifted = await readMeasures(mcp, "/scores/test-tune.mscx", { from: 13, to: 20 });
		expect(shifted).toBeToolText("D5:1 | E5 | F5 | G5 | A5 | B5 | C6 | D6");
	});

	test("appends empty bars at the end", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});
		await writeMeasures(mcp, "/scores/test-tune.mscx", { from: 1, content: "C4:1 | D4 | E4 | F4" });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await insertMeasures(mcp, "/scores/test-tune.mscx", { at: 5, count: 2 });

		expect(result.isError).toBeUndefined();

		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});
		const appended = await readMeasures(mcp, "/scores/test-tune.mscx", { from: 5, to: 6 });
		expect(appended).toBeToolText("R | R");
		const beyond = await readMeasures(mcp, "/scores/test-tune.mscx", { from: 1, to: 7 });
		expect(beyond).toBeToolError(
			"Measure range 1-7 exceeds score length (6 measures): /scores/test-tune.mscx",
		);
	});

	test("inserts bars into every staff", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano", "electric-bass"], measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});
		await writeMeasures(mcp, "/scores/test-tune.mscx", { from: 1, content: "C5:1 | D5 | E5 | F5" });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});
		await writeMeasures(mcp, "/scores/test-tune.mscx", {
			staff: 2,
			from: 1,
			content: "E2:1 | F2 | G2 | A2",
		});
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await insertMeasures(mcp, "/scores/test-tune.mscx", { at: 2, count: 1 });

		expect(result.isError).toBeUndefined();

		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});
		const trebleInserted = await readMeasures(mcp, "/scores/test-tune.mscx", { from: 2, to: 2 });
		expect(trebleInserted).toBeToolText("R");
		const trebleShifted = await readMeasures(mcp, "/scores/test-tune.mscx", { from: 3, to: 5 });
		expect(trebleShifted).toBeToolText("D5:1 | E5 | F5");
		const bassInserted = await readMeasures(mcp, "/scores/test-tune.mscx", { staff: 2, from: 2, to: 2 });
		expect(bassInserted).toBeToolText("R");
		const bassShifted = await readMeasures(mcp, "/scores/test-tune.mscx", { staff: 2, from: 3, to: 5 });
		expect(bassShifted).toBeToolText("F2:1 | G2 | A2");
	});

	test("(Snapshot) inserting at bar 1 keeps the signatures in the first bar", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 2 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});
		await writeMeasures(mcp, "/scores/test-tune.mscx", { from: 1, content: "C4:1 | D4" });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await insertMeasures(mcp, "/scores/test-tune.mscx", { at: 1, count: 1 });

		expect(result.isError).toBeUndefined();

		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});
		const readBack = await readMeasures(mcp, "/scores/test-tune.mscx", { from: 1, to: 1 });
		expect(readBack).toBeToolText("R");
		const shifted = await readMeasures(mcp, "/scores/test-tune.mscx", { from: 2, to: 3 });
		expect(shifted).toBeToolText("C4:1 | D4");
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("rejects inserting beyond the end of the score", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await insertMeasures(mcp, "/scores/test-tune.mscx", { at: 6, count: 1 });

		expect(result).toBeToolError(
			"Insert position 6 exceeds score length (4 measures): /scores/test-tune.mscx",
		);
	});
});
