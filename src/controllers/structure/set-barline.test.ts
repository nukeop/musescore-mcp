import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { createScore } from "../../test/create-score";
import "../../test/matchers";
import { BunFsMock } from "../../test/mocks/bun-fs";
import { setBarline } from "../../test/set-barline";
import { createTestClient, type TestClient } from "../../test/test-setup";
import { writeMeasures } from "../../test/write-measures";

describe("set_barline", () => {
	let mcp: TestClient;

	beforeEach(async () => {
		mcp = await createTestClient();
	});

	afterEach(async () => {
		BunFsMock.reset();
		await mcp.close();
	});

	test("(Snapshot) writes a start-repeat flag on the measure", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });

		const result = await setBarline(mcp, "/scores/test-tune.mscx", { measure: 2, type: "start-repeat" });

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("(Snapshot) writes an end-repeat with the default count 2", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });

		const result = await setBarline(mcp, "/scores/test-tune.mscx", { measure: 4, type: "end-repeat" });

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("(Snapshot) writes an end-repeat with an explicit count", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });

		const result = await setBarline(mcp, "/scores/test-tune.mscx", { measure: 4, type: "end-repeat", count: 3 });

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("(Snapshot) writes a double barline to all staves, after the bar's events", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano", "trumpet"], measures: 4 });
		await writeMeasures(mcp, "/scores/test-tune.mscx", { from: 2, content: "C4:1" });

		const result = await setBarline(mcp, "/scores/test-tune.mscx", { measure: 2, type: "double" });

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("(Snapshot) end-repeat replaces an existing double barline in all staves", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano", "trumpet"], measures: 4 });
		const setup = await setBarline(mcp, "/scores/test-tune.mscx", { measure: 3, type: "double" });
		expect(setup.isError).toBeUndefined();

		const result = await setBarline(mcp, "/scores/test-tune.mscx", { measure: 3, type: "end-repeat" });

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("(Snapshot) double replaces an existing end-repeat", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		const setup = await setBarline(mcp, "/scores/test-tune.mscx", { measure: 3, type: "end-repeat" });
		expect(setup.isError).toBeUndefined();

		const result = await setBarline(mcp, "/scores/test-tune.mscx", { measure: 3, type: "double" });

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("(Snapshot) normal clears both repeat flags from a one-bar repeat", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		const startSetup = await setBarline(mcp, "/scores/test-tune.mscx", { measure: 2, type: "start-repeat" });
		expect(startSetup.isError).toBeUndefined();
		const endSetup = await setBarline(mcp, "/scores/test-tune.mscx", { measure: 2, type: "end-repeat" });
		expect(endSetup.isError).toBeUndefined();

		const result = await setBarline(mcp, "/scores/test-tune.mscx", { measure: 2, type: "normal" });

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("(Snapshot) normal clears a double barline from all staves", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano", "trumpet"], measures: 4 });
		const setup = await setBarline(mcp, "/scores/test-tune.mscx", { measure: 2, type: "double" });
		expect(setup.isError).toBeUndefined();

		const result = await setBarline(mcp, "/scores/test-tune.mscx", { measure: 2, type: "normal" });

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("rejects count combined with a non-end-repeat type", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });

		const result = await setBarline(mcp, "/scores/test-tune.mscx", { measure: 2, type: "double", count: 3 });

		expect(result).toBeToolError("Count is only valid with type end-repeat");
	});

	test("rejects a measure beyond the end of the score", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });

		const result = await setBarline(mcp, "/scores/test-tune.mscx", { measure: 6, type: "double" });

		expect(result).toBeToolError(
			"Measure 6 exceeds score length (4 measures): /scores/test-tune.mscx",
		);
	});
});
