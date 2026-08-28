import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { addVolta } from "../../test/add-volta";
import { createScore } from "../../test/create-score";
import "../../test/matchers";
import { BunFsMock } from "../../test/mocks/bun-fs";
import { createTestClient, type TestClient } from "../../test/test-setup";

describe("add_volta", () => {
	let mcp: TestClient;

	beforeEach(async () => {
		mcp = await createTestClient();
	});

	afterEach(async () => {
		BunFsMock.reset();
		await mcp.close();
	});

	test("(Snapshot) writes a first ending with a closed hook by default, on the first staff only", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano", "trumpet"], measures: 6 });

		const result = await addVolta(mcp, "/scores/test-tune.mscx", { from: 2, to: 3, ending: 1 });

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("(Snapshot) writes an open second ending directly after the first", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano"], measures: 6 });
		const setup = await addVolta(mcp, "/scores/test-tune.mscx", { from: 2, to: 3, ending: 1 });
		expect(setup.isError).toBeUndefined();

		const result = await addVolta(mcp, "/scores/test-tune.mscx", { from: 4, to: 4, ending: 2 });

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("(Snapshot) writes a closed hook on a second ending when hook is closed", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });

		const result = await addVolta(mcp, "/scores/test-tune.mscx", {
			from: 2,
			to: 2,
			ending: 2,
			hook: "closed",
		});

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("(Snapshot) anchors a volta ending on the final measure inside that measure", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano"], measures: 4, time: "3/4" });

		const result = await addVolta(mcp, "/scores/test-tune.mscx", { from: 3, to: 4, ending: 2 });

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("rejects a volta overlapping an existing one, naming the bars", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano"], measures: 6 });
		const setup = await addVolta(mcp, "/scores/test-tune.mscx", { from: 2, to: 3, ending: 1 });
		expect(setup.isError).toBeUndefined();

		const result = await addVolta(mcp, "/scores/test-tune.mscx", { from: 3, to: 4, ending: 2 });

		expect(result).toBeToolError(
			"Volta 3-4 overlaps the existing volta at bars 2-3: /scores/test-tune.mscx",
		);
	});

	test("rejects an inverted range", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano"], measures: 6 });

		const result = await addVolta(mcp, "/scores/test-tune.mscx", { from: 5, to: 2, ending: 1 });

		expect(result).toBeToolError(
			"Volta range 5-2 is inverted (from exceeds to): /scores/test-tune.mscx",
		);
	});

	test("rejects a range beyond the end of the score", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });

		const result = await addVolta(mcp, "/scores/test-tune.mscx", { from: 3, to: 6, ending: 1 });

		expect(result).toBeToolError(
			"Measure 6 exceeds score length (4 measures): /scores/test-tune.mscx",
		);
	});
});
