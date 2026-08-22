import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { createScore } from "../../test/create-score";
import "../../test/matchers";
import { BunFsMock } from "../../test/mocks/bun-fs";
import { readMeasures } from "../../test/read-measures";
import { createTestClient, type TestClient } from "../../test/test-setup";
import { textContent } from "../../test/tool-result";
import { writeMeasures } from "../../test/write-measures";

describe("write_measures", () => {
	let mcp: TestClient;

	beforeEach(async () => {
		mcp = await createTestClient();
	});

	afterEach(async () => {
		BunFsMock.reset();
		await mcp.close();
	});

	test("writes notes, rests and dotted durations", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const notation = "C5:4 D5 E5 r | G5:2. r:4";
		const result = await writeMeasures(mcp, "/scores/test-tune.mscx", { from: 1, content: notation });

		expect(result.isError).toBeUndefined();

		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});
		const readBack = await readMeasures(mcp, "/scores/test-tune.mscx", { from: 1, to: 2 });
		expect(textContent(readBack)).toBe(notation);
	});

	test("writes sounding pitch and both tonal pitch classes for a transposing staff", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		await writeMeasures(mcp, "/scores/test-tune.mscx", { from: 1, content: "A4:1" });

		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("rejects a bar that doesn't match the time signature, and says in which bar/beat", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await writeMeasures(mcp, "/scores/test-tune.mscx", {
			from: 1,
			content: "C5:4 D5 E5 F5 G5",
		});

		expect(result).toBeToolError("Bar 1 overflows at beat 5");
	});

	test("rejects a bar that does not fill the time signature, and says what's missing", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await writeMeasures(mcp, "/scores/test-tune.mscx", {
			from: 1,
			content: "C5:4 D5 E5",
		});

		expect(result).toBeToolError("Bar 1 is short by a quarter note");
	});

	test("doesn't modify bars outside the written range", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		await writeMeasures(mcp, "/scores/test-tune.mscx", { from: 2, content: "C5:1" });

		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});
		const bar1 = await readMeasures(mcp, "/scores/test-tune.mscx", { from: 1, to: 1 });
		const bar4 = await readMeasures(mcp, "/scores/test-tune.mscx", { from: 4, to: 4 });
		expect(textContent(bar1)).toBe("R");
		expect(textContent(bar4)).toBe("R");
	});

	test("errors for a file that does not exist", async () => {
		BunFsMock.mockNoFile();

		const result = await writeMeasures(mcp, "/scores/missing.mscx", {
			from: 1,
			content: "C5:1",
		});

		expect(result).toBeToolError("ENOENT: no such file or directory, open '/scores/missing.mscx'");
	});
});
