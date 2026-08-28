import type { Harmony, Measure, VoiceEvent } from "../../model/score";
import { chordSymbol } from "../../notation/chord-symbol";

const BARS_PER_LINE = 4;

export function chordLines(measures: Measure[]): string[] {
	const cells = measures.map(barCell);
	return lineStarts(cells.length).flatMap((start) => {
		const row = cells.slice(start, start + BARS_PER_LINE);
		if (row.every((cell) => cell === "")) {
			return [];
		}
		return [`  ${start + 1}: | ${row.join(" | ")} |`];
	});
}

function lineStarts(barCount: number): number[] {
	const lineCount = Math.ceil(barCount / BARS_PER_LINE);
	return Array.from({ length: lineCount }, (_, line) => line * BARS_PER_LINE);
}

function barCell(measure: Measure): string {
	return measure.voices
		.flatMap((voice) => voice.events)
		.flatMap(harmoniesOf)
		.map(chordSymbol)
		.join(" ");
}

function harmoniesOf(event: VoiceEvent): Harmony[] {
	if (event.kind === "tuplet") {
		return event.events.flatMap(harmoniesOf);
	}
	if (event.harmony) {
		return [event.harmony];
	}
	return [];
}
