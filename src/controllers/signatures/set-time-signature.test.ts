import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { createScore } from "../../test/create-score";
import "../../test/matchers";
import { BunFsMock } from "../../test/mocks/bun-fs";
import { readMeasures } from "../../test/read-measures";
import { setTimeSignature } from "../../test/set-time-signature";
import { createTestClient, type TestClient } from "../../test/test-setup";
import { writeMeasures } from "../../test/write-measures";

describe("set_time_signature", () => {
	let mcp: TestClient;

	beforeEach(async () => {
		mcp = await createTestClient();
	});

	afterEach(async () => {
		BunFsMock.reset();
		await mcp.close();
	});

	test("(Snapshot) writes a time change at the start of an empty range to all staves", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano", "electric-bass"], measures: 6 });
		await writeMeasures(mcp, "/scores/test-tune.mscx", { from: 1, content: "C4:1 | D4" });

		const result = await setTimeSignature(mcp, "/scores/test-tune.mscx", { measure: 3, time: "3/4" });

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("(Snapshot) stops the affected range at the next existing TimeSig", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano"], measures: 6 });
		const setup = await setTimeSignature(mcp, "/scores/test-tune.mscx", { measure: 5, time: "6/8" });
		expect(setup.isError).toBeUndefined();
		await writeMeasures(mcp, "/scores/test-tune.mscx", { from: 6, content: "E4:4. E4" });

		const result = await setTimeSignature(mcp, "/scores/test-tune.mscx", { measure: 2, time: "3/4" });

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("rejects bars with notes or split rests, naming them", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano"], measures: 6 });
		await writeMeasures(mcp, "/scores/test-tune.mscx", { from: 3, content: "C4:1 | D4 | r:2 r" });

		const result = await setTimeSignature(mcp, "/scores/test-tune.mscx", { measure: 2, time: "3/4" });

		expect(result).toBeToolError(
			"Measures 3, 4, 5 must be empty (only measure rests) to change the time signature at measure 2: /scores/test-tune.mscx",
		);
	});

	test("accepts a measure rest carrying a chord symbol", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		await writeMeasures(mcp, "/scores/test-tune.mscx", { from: 2, content: "[F] R" });

		const result = await setTimeSignature(mcp, "/scores/test-tune.mscx", { measure: 2, time: "3/4" });

		expect(result.isError).toBeUndefined();
		const readBack = await readMeasures(mcp, "/scores/test-tune.mscx", { from: 2, to: 2 });
		expect(readBack).toBeToolText("[F] R");
	});

	test("(Snapshot) replaces an existing TimeSig at the same bar instead of duplicating", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		const setup = await setTimeSignature(mcp, "/scores/test-tune.mscx", { measure: 3, time: "3/4" });
		expect(setup.isError).toBeUndefined();

		const result = await setTimeSignature(mcp, "/scores/test-tune.mscx", { measure: 3, time: "6/8" });

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("rejects a measure beyond the end of the score", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });

		const result = await setTimeSignature(mcp, "/scores/test-tune.mscx", { measure: 6, time: "3/4" });

		expect(result).toBeToolError(
			"Measure 6 exceeds score length (4 measures): /scores/test-tune.mscx",
		);
	});

	test("(Snapshot) rewrites the duration of MuseScore-authored measure rests", async () => {
		BunFsMock.mockWrite();

		const result = await setTimeSignature(mcp, "src/fixtures/signature-changes/signature-changes.mscx", {
			measure: 6,
			time: "3/4",
		});

		expect(result.isError).toBeUndefined();
		expect(
			BunFsMock.getWrittenFile("src/fixtures/signature-changes/signature-changes.mscx"),
		).toMatchSnapshot();
	});
});
