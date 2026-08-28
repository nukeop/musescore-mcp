import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { addVolta } from "../../test/add-volta";
import { createScore } from "../../test/create-score";
import { getOverview } from "../../test/get-overview";
import "../../test/matchers";
import { BunFsMock } from "../../test/mocks/bun-fs";
import { setBarline } from "../../test/set-barline";
import { setKeySignature } from "../../test/set-key-signature";
import { setLayoutBreak } from "../../test/set-layout-break";
import { setSectionMarker } from "../../test/set-section-marker";
import { setTempo } from "../../test/set-tempo";
import { setText } from "../../test/set-text";
import { setTimeSignature } from "../../test/set-time-signature";
import { createTestClient, type TestClient } from "../../test/test-setup";
import { writeMeasures } from "../../test/write-measures";

describe("get_overview", () => {
	let mcp: TestClient;

	beforeEach(async () => {
		mcp = await createTestClient();
	});

	afterEach(async () => {
		BunFsMock.reset();
		await mcp.close();
	});

	test("summarizes a freshly created score", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp);
		const reads = BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await getOverview(mcp);

		expect(reads).toHaveBeenCalledWith("/scores/test-tune.mscx");
		expect(result.isError).toBeUndefined();
		expect(result).toMatchSnapshot();
	});

	test("lists every instrument", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["tenor-saxophone", "piano"] });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await getOverview(mcp);

		expect(result.isError).toBeUndefined();
		expect(result).toMatchSnapshot();
	});

	test("summarizes example sheet", async () => {
		const reads = BunFsMock.spyOnFile();

		const result = await getOverview(mcp, "src/fixtures/simple-lead-sheet/simple-lead-sheet.mscx");

		expect(reads).toHaveBeenCalledWith("src/fixtures/simple-lead-sheet/simple-lead-sheet.mscx");
		expect(result.isError).toBeUndefined();
		expect(result).toMatchSnapshot();
	});

	test("reports the form map and chord grid of a MuseScore-authored score", async () => {
		BunFsMock.spyOnFile();

		const result = await getOverview(mcp, "src/fixtures/overview/overview.mscx");

		expect(result.isError).toBeUndefined();
		expect(result).toBeToolText(
			`Untitled score by Composer / arranger
Key: C/Am | Time: 4/4 | Bars: 28
Instruments:
  1. Piano
Form:
  1: section "A" | start-repeat | staff text "This is some staff text"
  5: system text "And this is some system text"
  8: end-repeat x2 | system break
  9: section "B" | key: D/Bm | time: 5/4 | tempo: 80 bpm | swing: eighth "Swing"
  12: swing: off "Straight"
  15: volta 1 (bars 15-16)
  17: volta 2 (bar 17)
  18: double barline | page break
  24: section break
  25: time: 4/4
Chords:
  1: | D-7 | G7 C♯7 | C^7 |  |
  5: | A-7 | D-7 | E0 | C^7 |`,
		);
	});

	test("reports structure and chords written through the editing tools", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		const file = "/scores/test-tune.mscx";
		await createScore(mcp, { instruments: ["piano"], key: "C", tempo: 120, measures: 12 });
		const chords = await writeMeasures(mcp, file, {
			from: 1,
			content: "[C^7] R | [A-7] R | [D-7] R | [G7] R",
		});
		expect(chords.isError).toBeUndefined();
		const marker = await setSectionMarker(mcp, file, { measure: 1, text: "A" });
		expect(marker.isError).toBeUndefined();
		const startRepeat = await setBarline(mcp, file, { measure: 1, type: "start-repeat" });
		expect(startRepeat.isError).toBeUndefined();
		const endRepeat = await setBarline(mcp, file, { measure: 4, type: "end-repeat", count: 3 });
		expect(endRepeat.isError).toBeUndefined();
		const systemBreak = await setLayoutBreak(mcp, file, { measure: 4, type: "system" });
		expect(systemBreak.isError).toBeUndefined();
		const swing = await setText(mcp, file, {
			measure: 2,
			text: "Swing",
			style: "system",
			swing: "eighth",
		});
		expect(swing.isError).toBeUndefined();
		const straight = await setText(mcp, file, {
			measure: 5,
			text: "Straight",
			style: "system",
			swing: "off",
		});
		expect(straight.isError).toBeUndefined();
		const staffText = await setText(mcp, file, { measure: 3, text: "solo fills", style: "staff" });
		expect(staffText.isError).toBeUndefined();
		const volta = await addVolta(mcp, file, { from: 5, to: 6, ending: 1, hook: "open" });
		expect(volta.isError).toBeUndefined();
		const secondVolta = await addVolta(mcp, file, { from: 7, to: 7, ending: 2, hook: "closed" });
		expect(secondVolta.isError).toBeUndefined();
		const double = await setBarline(mcp, file, { measure: 8, type: "double" });
		expect(double.isError).toBeUndefined();
		const sectionBreak = await setLayoutBreak(mcp, file, { measure: 8, type: "section" });
		expect(sectionBreak.isError).toBeUndefined();
		const key = await setKeySignature(mcp, file, { measure: 9, key: "F" });
		expect(key.isError).toBeUndefined();
		const time = await setTimeSignature(mcp, file, { measure: 9, time: "3/4" });
		expect(time.isError).toBeUndefined();
		const tempo = await setTempo(mcp, file, { measure: 9, bpm: 90 });
		expect(tempo.isError).toBeUndefined();
		const tupletChord = await writeMeasures(mcp, file, {
			from: 9,
			content: "tuplet(3:2 [E7] C5:8 D5 E5) r:4 r:4",
		});
		expect(tupletChord.isError).toBeUndefined();

		const result = await getOverview(mcp);

		expect(result.isError).toBeUndefined();
		expect(result).toBeToolText(
			`Test Tune by Test Composer
Key: C/Am | Time: 4/4 | Tempo: 120 bpm | Bars: 12
Instruments:
  1. Piano
Form:
  1: section "A" | start-repeat
  2: swing: eighth "Swing"
  3: staff text "solo fills"
  4: end-repeat x3 | system break
  5: swing: off "Straight" | volta 1 (bars 5-6, open)
  7: volta 2 (bar 7, closed)
  8: double barline | section break
  9: key: F/Dm | time: 3/4 | tempo: 90 bpm
Chords:
  1: | C^7 | A-7 | D-7 | G7 |
  9: | E7 |  |  |  |`,
		);
	});

	test("omits the Form and Chords sections on a score without structure or chords", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp);
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await getOverview(mcp);

		expect(result.isError).toBeUndefined();
		expect(result).toBeToolText(
			`Test Tune by Test Composer
Key: E♭/Cm | Time: 4/4 | Tempo: 160 bpm | Bars: 32
Instruments:
  1. Tenor Saxophone`,
		);
	});

	test("reports an error for a file that does not exist", async () => {
		BunFsMock.mockNoFile();

		const result = await getOverview(mcp, "/scores/missing.mscx");

		expect(result).toBeToolError("ENOENT: no such file or directory, open '/scores/missing.mscx'");
	});
});
