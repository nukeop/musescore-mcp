import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { createScore } from "../../test/create-score";
import "../../test/matchers";
import { BunFsMock } from "../../test/mocks/bun-fs";
import { readMeasures } from "../../test/read-measures";
import { createTestClient, type TestClient } from "../../test/test-setup";
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

		const result = await writeMeasures(mcp, "/scores/test-tune.mscx", {
			from: 1,
			content: "C5:4 D5 E5 r | G5:2. r:4",
		});

		expect(result.isError).toBeUndefined();

		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});
		const readBack = await readMeasures(mcp, "/scores/test-tune.mscx", { from: 1, to: 2 });
		expect(readBack).toBeToolText("C5:4 D5 E5 r | G5:2. r:4");
	});

	test("writes chords with several notes in the same spot", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await writeMeasures(mcp, "/scores/test-tune.mscx", {
			from: 1,
			content: "chord(C4 E4 G4):4 F4 chord(B♭3 D4 F4):2 | chord(D4 F♯4 A4 C5):1",
		});

		expect(result.isError).toBeUndefined();

		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});
		const readBack = await readMeasures(mcp, "/scores/test-tune.mscx", { from: 1, to: 2 });
		expect(readBack).toBeToolText("chord(C4 E4 G4):4 F4 chord(B♭3 D4 F4):2 | chord(D4 F♯4 A4 C5):1");
	});

	test("writes sharps and flats and reads them back with the same enharmonic spelling", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await writeMeasures(mcp, "/scores/test-tune.mscx", {
			from: 1,
			content: "B♭4:4 F♯5 E♭5 G♯4 | D♭5:2 A♯4",
		});

		expect(result.isError).toBeUndefined();

		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});
		const readBack = await readMeasures(mcp, "/scores/test-tune.mscx", { from: 1, to: 2 });
		expect(readBack).toBeToolText("B♭4:4 F♯5 E♭5 G♯4 | D♭5:2 A♯4");
	});

	test("writes triplets and quintuplets", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const notation = [
			"tuplet(3:2 C5:8 D5 E5) tuplet(3:2 F5:4 G5 A5) tuplet(3:2 B5:8 C6 D6)",
			"tuplet(5:4 C5:16 D5 E5 F5 G5) tuplet(5:4 A5:8 B5 C6 D6 E6) tuplet(5:4 F6:16 G6 A6 B6 C7)",
			"tuplet(5:4 C5:32 D5 E5 F5 G5) tuplet(3:2 A5:16 B5 C6) r:4 r:2",
			"tuplet(3:2 C5:4 D5:8) tuplet(3:2 E5 F5:4) r:2",
		].join(" | ");
		const result = await writeMeasures(mcp, "/scores/test-tune.mscx", { from: 1, content: notation });

		expect(result.isError).toBeUndefined();

		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});
		const readBack = await readMeasures(mcp, "/scores/test-tune.mscx", { from: 1, to: 4 });
		expect(readBack).toBeToolText(
			"tuplet(3:2 C5:8 D5 E5) tuplet(3:2 F5:4 G5 A5) tuplet(3:2 B5:8 C6 D6) | tuplet(5:4 C5:16 D5 E5 F5 G5) tuplet(5:4 A5:8 B5 C6 D6 E6) tuplet(5:4 F6:16 G6 A6 B6 C7) | tuplet(5:4 C5:32 D5 E5 F5 G5) tuplet(3:2 A5:16 B5 C6) r:4 r:2 | tuplet(3:2 C5:4 D5:8) tuplet(3:2 E5 F5:4) r:2",
		);
	});

	test("writes more complex tuplets", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], time: "9/8", measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await writeMeasures(mcp, "/scores/test-tune.mscx", {
			from: 1,
			content: "tuplet(2:3 C5:8 D5) tuplet(2:3 E5 F5) tuplet(2:3 G5 A5)",
		});

		expect(result.isError).toBeUndefined();

		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});
		const readBack = await readMeasures(mcp, "/scores/test-tune.mscx", { from: 1, to: 1 });
		expect(readBack).toBeToolText("tuplet(2:3 C5:8 D5) tuplet(2:3 E5 F5) tuplet(2:3 G5 A5)");
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

	test("errors on a bar that doesn't match the time signature, and says in which bar/beat", async () => {
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

	test("errors on a bar that does not fill the time signature, and says what's missing", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await writeMeasures(mcp, "/scores/test-tune.mscx", {
			from: 1,
			content: "C5:4 D5 E5",
		});

		expect(result).toBeToolError("Bar 1 is short by 1/4 of a whole note");
	});

	test("errors on an invalid note name", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await writeMeasures(mcp, "/scores/test-tune.mscx", { from: 1, content: "H5:1" });

		expect(result).toBeToolError("Invalid note: H5");
	});

	test("enforces unicode ♯ and ♭ accidentals", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await writeMeasures(mcp, "/scores/test-tune.mscx", { from: 1, content: "Bb4:1" });

		expect(result).toBeToolError("Invalid note: Bb4");
	});

	test("rejects an invalid duration", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await writeMeasures(mcp, "/scores/test-tune.mscx", { from: 1, content: "C5:3" });

		expect(result).toBeToolError("Invalid duration: 3");
	});

	test("rejects a first note with no duration to inherit", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await writeMeasures(mcp, "/scores/test-tune.mscx", { from: 1, content: "C5 D5 E5 F5" });

		expect(result).toBeToolError("Missing duration: C5");
	});

	test("errors on unexpected text after the last bar", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await writeMeasures(mcp, "/scores/test-tune.mscx", { from: 1, content: "C5:1 )" });

		expect(result).toBeToolError('Expected end of input, got ")" at offset 5');
	});

	test("rejects a duration colon with nothing after it", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await writeMeasures(mcp, "/scores/test-tune.mscx", { from: 1, content: "C5:" });

		expect(result).toBeToolError("Expected a word, got end of input at offset 3");
	});

	test("rejects an empty bar between separators", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await writeMeasures(mcp, "/scores/test-tune.mscx", {
			from: 1,
			content: "C5:1 | | D5:1",
		});

		expect(result).toBeToolError('Expected a word, got "|" at offset 7');
	});

	test("rejects content that overflows past the end of the score", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await writeMeasures(mcp, "/scores/test-tune.mscx", {
			from: 3,
			content: "C5:1 | D5:1 | E5:1",
		});

		expect(result).toBeToolError(
			"Measure range 3-5 exceeds score length (4 measures): /scores/test-tune.mscx",
		);
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
		expect(bar1).toBeToolText("R");
		expect(bar4).toBeToolText("R");
	});

	test("replaces content", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		await writeMeasures(mcp, "/scores/test-tune.mscx", { from: 1, content: "C5:4 D5 E5 F5" });

		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});
		await writeMeasures(mcp, "/scores/test-tune.mscx", { from: 1, content: "G4:2 A4:2" });

		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});
		const readBack = await readMeasures(mcp, "/scores/test-tune.mscx", { from: 1, to: 1 });
		expect(readBack).toBeToolText("G4:2 A4");
	});

	test("writes to the requested staff", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["trumpet", "piano"], measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await writeMeasures(mcp, "/scores/test-tune.mscx", {
			staff: 2,
			from: 1,
			content: "C4:1",
		});

		expect(result.isError).toBeUndefined();

		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});
		const piano = await readMeasures(mcp, "/scores/test-tune.mscx", { staff: 2, from: 1, to: 1 });
		const trumpet = await readMeasures(mcp, "/scores/test-tune.mscx", { staff: 1, from: 1, to: 1 });
		expect(piano).toBeToolText("C4:1");
		expect(trumpet).toBeToolText("R");
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
