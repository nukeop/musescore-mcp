import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import "../../test/matchers";
import { BunFsMock } from "../../test/mocks/bun-fs";
import { readMeasures } from "../../test/read-measures";
import { createTestClient, type TestClient } from "../../test/test-setup";

describe("read_measures", () => {
	let mcp: TestClient;

	beforeEach(async () => {
		mcp = await createTestClient();
	});

	afterEach(async () => {
		BunFsMock.reset();
		await mcp.close();
	});

	test("prints notes, rests and dotted durations as bar notation", async () => {
		const result = await readMeasures(mcp, "src/fixtures/simple-lead-sheet/simple-lead-sheet.mscx", {
			from: 3,
			to: 5,
		});

		expect(result.isError).toBeUndefined();
		expect(result).toBeToolText("[G7] D5:2 C5:4. r:8 | R | [A-7] C5 B4 A4 G4 F4:4 E4");
	});

	test("prints a tie across the barline", async () => {
		const result = await readMeasures(mcp, "src/fixtures/simple-lead-sheet/simple-lead-sheet.mscx", {
			from: 1,
			to: 2,
		});

		expect(result.isError).toBeUndefined();
		expect(result).toBeToolText("[C^7] C5:4. B4:8 A4 G4 r F4~ | [D-7] F4:2. E4:4");
	});

	test("prints chord symbols from the fixture", async () => {
		const result = await readMeasures(mcp, "src/fixtures/simple-lead-sheet/simple-lead-sheet.mscx", {
			from: 1,
			to: 2,
		});

		expect(result.isError).toBeUndefined();
		expect(result).toBeToolText("[C^7] C5:4. B4:8 A4 G4 r F4~ | [D-7] F4:2. E4:4");
	});

	test("prints a chord symbol that MuseScore writes before a tuplet on the tuplet's first note", async () => {
		const result = await readMeasures(mcp, "src/fixtures/musescore-harmony/musescore-harmony.mscx", {
			from: 1,
			to: 1,
		});

		expect(result.isError).toBeUndefined();
		expect(result).toBeToolText("tuplet(3:2 [D-] E4:4 F4 E5) B4:2");
	});

	test("does not attach a chord symbol placed between events to the next note", async () => {
		const result = await readMeasures(mcp, "src/fixtures/musescore-harmony/musescore-harmony.mscx", {
			from: 2,
			to: 2,
		});

		expect(result.isError).toBeUndefined();
		expect(result).toBeToolText("[C^7] C5:2 D5");
	});

	test("prints the bass note of a slash chord that MuseScore writes", async () => {
		const result = await readMeasures(mcp, "src/fixtures/musescore-harmony/musescore-harmony.mscx", {
			from: 4,
			to: 4,
		});

		expect(result.isError).toBeUndefined();
		expect(result).toBeToolText("[A7/G] R");
	});

	test("errors for a file that does not exist", async () => {
		BunFsMock.mockNoFile();

		const result = await readMeasures(mcp, "/scores/missing.mscx", { from: 1, to: 2 });

		expect(result).toBeToolError("ENOENT: no such file or directory, open '/scores/missing.mscx'");
	});

	test("errors when the range is outside the score", async () => {
		const result = await readMeasures(mcp, "src/fixtures/simple-lead-sheet/simple-lead-sheet.mscx", {
			from: 7,
			to: 10,
		});

		expect(result).toBeToolError(
			"Measure range 7-10 exceeds score length (8 measures): src/fixtures/simple-lead-sheet/simple-lead-sheet.mscx",
		);
	});
});
