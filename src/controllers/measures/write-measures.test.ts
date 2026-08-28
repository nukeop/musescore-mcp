import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { createScore } from "../../test/create-score";
import "../../test/matchers";
import { BunFsMock } from "../../test/mocks/bun-fs";
import { readMeasures } from "../../test/read-measures";
import { setBarline } from "../../test/set-barline";
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

	test("(Snapshot) edits one measure of a MuseScore-authored file", async () => {
		BunFsMock.mockWrite();

		const result = await writeMeasures(mcp, "src/fixtures/simple-lead-sheet/simple-lead-sheet.mscx", {
			from: 1,
			content: "C5:4 D5 E5 F5",
		});

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("src/fixtures/simple-lead-sheet/simple-lead-sheet.mscx")).toMatchSnapshot();
	});

	test("writes notes, rests and dotted durations (round trip)", async () => {
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

	test("a duration carries over across barlines (round trip)", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await writeMeasures(mcp, "/scores/test-tune.mscx", {
			from: 1,
			content: "C4:1 | D4 | E4:2 F4 | G4 A4",
		});

		expect(result.isError).toBeUndefined();

		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});
		const readBack = await readMeasures(mcp, "/scores/test-tune.mscx", { from: 1, to: 4 });
		expect(readBack).toBeToolText("C4:1 | D4 | E4:2 F4 | G4 A4");
	});

	test("writes sharps and flats and reads them back with the same enharmonic spelling (round trip)", async () => {
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

	test("writes chords with several notes in the same spot (round trip)", async () => {
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

	test("writes triplets and quintuplets (round trip)", async () => {
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

	test("writes duplets in compound meter (round trip)", async () => {
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

	test("writes sextuplets (round trip)", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await writeMeasures(mcp, "/scores/test-tune.mscx", {
			from: 1,
			content: "tuplet(6:4 C5:16 D5 E5 F5 G5 A5) tuplet(6:4 B5 C6 D6 E6 F6 G6) r:2",
		});

		expect(result.isError).toBeUndefined();

		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});
		const readBack = await readMeasures(mcp, "/scores/test-tune.mscx", { from: 1, to: 1 });
		expect(readBack).toBeToolText("tuplet(6:4 C5:16 D5 E5 F5 G5 A5) tuplet(6:4 B5 C6 D6 E6 F6 G6) r:2");
	});

	test.each([
		["tie", "C5:4~ C5:4 r:2", "C5:4~ C5 r:2"],
		["glissando", "C5:4(gliss) D5 E5 F5", "C5:4(gliss) D5 E5 F5"],
		["slur", "slur(C5:4 D5 E5) F5", "slur(C5:4 D5 E5) F5"],
		["grace note", "grace(D5:8) C5:1", "grace(D5:8) C5:1"],
	])("writes a %s within the same bar (round trip)", async (_, content, expected) => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await writeMeasures(mcp, "/scores/test-tune.mscx", { from: 1, content });
		expect(result.isError).toBeUndefined();

		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});
		const readBack = await readMeasures(mcp, "/scores/test-tune.mscx", { from: 1, to: 1 });
		expect(readBack).toBeToolText(expected);
	});

	test.each([
		["tie", "r:2 r:4 r:8 C5:8~ | C5:2. r:4", "r:2 r:4 r:8 C5~ | C5:2. r:4"],
		["glissando", "C5:2 D5(gliss) | E5:4 F5 G5 A5", "C5:2 D5(gliss) | E5:4 F5 G5 A5"],
		["slur", "r:8 r r:4 r:8 r slur(G4 A4 | B4 C5) r:4 r:2", "r:8 r r:4 r:8 r slur(G4 A4 | B4 C5) r:4 r:2"],
	])("writes a %s across the barline (round trip)", async (_, content, expected) => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await writeMeasures(mcp, "/scores/test-tune.mscx", { from: 1, content });
		expect(result.isError).toBeUndefined();

		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});
		const readBack = await readMeasures(mcp, "/scores/test-tune.mscx", { from: 1, to: 2 });
		expect(readBack).toBeToolText(expected);
	});

	test("writes a tied chord (round trip)", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await writeMeasures(mcp, "/scores/test-tune.mscx", {
			from: 1,
			content: "chord(C4 E4 G4):2~ chord(C4 E4 G4):2",
		});

		expect(result.isError).toBeUndefined();

		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});
		const readBack = await readMeasures(mcp, "/scores/test-tune.mscx", { from: 1, to: 1 });
		expect(readBack).toBeToolText("chord(C4 E4 G4):2~ chord(C4 E4 G4)");
	});

	test("replaces content (round trip)", async () => {
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

	test("doesn't modify bars outside the written range (round trip)", async () => {
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

	test("writes to the requested staff (round trip)", async () => {
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

	test("(Snapshot) writes a transposing staff", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		await writeMeasures(mcp, "/scores/test-tune.mscx", { from: 1, content: "A4:1" });

		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("(Snapshot) writes tuplets", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 1 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		await writeMeasures(mcp, "/scores/test-tune.mscx", {
			from: 1,
			content: "tuplet(3:2 C5:8 D5 E5) r:4 r:2",
		});

		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("(Snapshot) writes ties", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 2 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		await writeMeasures(mcp, "/scores/test-tune.mscx", {
			from: 1,
			content: "G4:2 A4:2~ | A4:2~ A4:2",
		});

		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("errors on a bar that overflows the time signature", async () => {
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

	test("errors on a bar that does not fill the time signature", async () => {
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

		expect(result).toBeToolError("Expected eof, got rparen at offset 5");
	});

	test("rejects a duration colon with nothing after it", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await writeMeasures(mcp, "/scores/test-tune.mscx", { from: 1, content: "C5:" });

		expect(result).toBeToolError("Expected a word, got eof at offset 3");
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

		expect(result).toBeToolError("Expected a word, got pipe at offset 7");
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

	test("errors for a file that does not exist", async () => {
		BunFsMock.mockNoFile();

		const result = await writeMeasures(mcp, "/scores/missing.mscx", {
			from: 1,
			content: "C5:1",
		});

		expect(result).toBeToolError("ENOENT: no such file or directory, open '/scores/missing.mscx'");
	});

	test("writes chord symbols (round trip)", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await writeMeasures(mcp, "/scores/test-tune.mscx", {
			from: 1,
			content: "[C-7] C4:2 [F7] C4:2",
		});

		expect(result.isError).toBeUndefined();

		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});
		const readBack = await readMeasures(mcp, "/scores/test-tune.mscx", { from: 1, to: 1 });
		expect(readBack).toBeToolText("[C-7] C4:2 [F7] C4");
	});

	test("writes chord symbols with accidentals in the root (round trip)", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await writeMeasures(mcp, "/scores/test-tune.mscx", {
			from: 1,
			content: "[B♭7] C4:2 [F♯-7] C4:2",
		});

		expect(result.isError).toBeUndefined();

		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});
		const readBack = await readMeasures(mcp, "/scores/test-tune.mscx", { from: 1, to: 1 });
		expect(readBack).toBeToolText("[B♭7] C4:2 [F♯-7] C4");
	});

	test("writes a chord symbol on a rest (round trip)", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await writeMeasures(mcp, "/scores/test-tune.mscx", {
			from: 1,
			content: "[D-7] r:2 [G7] C4:2",
		});

		expect(result.isError).toBeUndefined();

		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});
		const readBack = await readMeasures(mcp, "/scores/test-tune.mscx", { from: 1, to: 1 });
		expect(readBack).toBeToolText("[D-7] r:2 [G7] C4");
	});

	test("writes chord symbols in 5/4 (round trip)", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], time: "5/4", measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await writeMeasures(mcp, "/scores/test-tune.mscx", {
			from: 1,
			content: "[E♭-7] C4:2. [B♭7] D4:2",
		});

		expect(result.isError).toBeUndefined();

		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});
		const readBack = await readMeasures(mcp, "/scores/test-tune.mscx", { from: 1, to: 1 });
		expect(readBack).toBeToolText("[E♭-7] C4:2. [B♭7] D4:2");
	});

	test("(Snapshot) writes chord symbol XML", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 1 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		await writeMeasures(mcp, "/scores/test-tune.mscx", {
			from: 1,
			content: "[E♭^7] C4:2 [A-7] D4:2",
		});

		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("writes annotations (round trip)", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const content = "C5:8' D5> E5(tr) F5(mord) G5(scoop) A5 B5 C6";
		const result = await writeMeasures(mcp, "/scores/test-tune.mscx", { from: 1, content });

		expect(result.isError).toBeUndefined();

		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});
		const readBack = await readMeasures(mcp, "/scores/test-tune.mscx", { from: 1, to: 1 });
		expect(readBack).toBeToolText(content);
	});

	test("(Snapshot) writes annotation XML", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { measures: 1 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await writeMeasures(mcp, "/scores/test-tune.mscx", {
			from: 1,
			content: "C5:4' D5> E5(tr) F5(scoop)",
		});

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("(Snapshot) writes glissando XML", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 1 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		await writeMeasures(mcp, "/scores/test-tune.mscx", {
			from: 1,
			content: "C5:4(gliss) D5 E5 F5",
		});

		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("omits a slur that starts before the read range", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await writeMeasures(mcp, "/scores/test-tune.mscx", {
			from: 1,
			content: "r:8 r r:4 r:8 r slur(G4 A4 | B4 C5) r:4 r:2",
		});

		expect(result.isError).toBeUndefined();

		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});
		const readBack = await readMeasures(mcp, "/scores/test-tune.mscx", { from: 2, to: 2 });
		expect(readBack).toBeToolText("B4:8 C5 r:4 r:2");
	});

	test("(Snapshot) writes a grace note", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 1 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await writeMeasures(mcp, "/scores/test-tune.mscx", {
			from: 1,
			content: "grace(D5:8) C5:1",
		});

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("(Snapshot) writes slurs", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 2 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await writeMeasures(mcp, "/scores/test-tune.mscx", {
			from: 1,
			content: "slur(C5:8 D5 E5) r:8 r:4 slur(G4:4 | A4:4) r:4 r:2",
		});

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test.each([
		["a group with two grace notes", "grace(D5:8 E5) C5:1", "Expected rparen, got word at offset 11"],
		["an unclosed slur", "slur(C5:4 D5 E5 F5", "Unclosed slur"],
		["a nested slur", "slur(C5:4 slur(D5 E5) F5)", "Nested slur"],
		["a slur with fewer than two notes", "slur(C5:4) D5 E5 F5", "Slur must contain at least two notes"],
	])("rejects %s", async (_, content, message) => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await writeMeasures(mcp, "/scores/test-tune.mscx", { from: 1, content });

		expect(result).toBeToolError(message);
	});

	test("rejects an unknown annotation name", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { measures: 4 });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await writeMeasures(mcp, "/scores/test-tune.mscx", { from: 1, content: "C5:4(xyz)" });

		expect(result.isError).toBe(true);
		expect(result.content).toEqual([
			expect.objectContaining({ type: "text", text: expect.stringContaining("xyz") }),
		]);
	});

	test("(Snapshot) keeps a double barline after the rewritten events", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		const setup = await setBarline(mcp, "/scores/test-tune.mscx", { measure: 2, type: "double" });
		expect(setup.isError).toBeUndefined();

		const result = await writeMeasures(mcp, "/scores/test-tune.mscx", { from: 2, content: "C4:1" });

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});
});
