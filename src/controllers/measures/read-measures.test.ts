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
		expect(result).toBeToolText("D5:2 C5:4. r:8 | R | C5 B4 A4 G4 F4:4 E4");
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
