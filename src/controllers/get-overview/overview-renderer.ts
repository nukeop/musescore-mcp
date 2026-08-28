import { keyName } from "../../model/keys";
import type { Measure, Score } from "../../model/score";
import { bpm } from "../../model/tempo";
import { chordLines } from "./chord-grid";
import { formLines } from "./form-lines";

export class OverviewRenderer {
	constructor(private readonly score: Score) {}

	render(): string {
		const { title, composer } = this.score.header;
		return [
			`${title} by ${composer}`,
			this.signatureLine(),
			"Instruments:",
			...this.instrumentLines(),
			...section("Form:", formLines(this.measures())),
			...section("Chords:", chordLines(this.measures())),
		].join("\n");
	}

	private measures(): Measure[] {
		return this.score.staves[0]?.measures ?? [];
	}

	private signatureLine(): string {
		const measures = this.measures();
		const [first] = measures;
		const segments: string[] = [];
		if (first?.keySig) {
			segments.push(`Key: ${keyName(first.keySig.concertKey)}`);
		}
		if (first?.timeSig) {
			segments.push(`Time: ${first.timeSig.beats}/${first.timeSig.beatUnit}`);
		}
		if (first?.tempo) {
			segments.push(`Tempo: ${bpm(first.tempo)} bpm`);
		}
		segments.push(`Bars: ${measures.length}`);
		return segments.join(" | ");
	}

	private instrumentLines(): string[] {
		return this.score.parts.map((part, index) => `  ${index + 1}. ${part.name}`);
	}
}

function section(title: string, lines: string[]): string[] {
	if (lines.length === 0) {
		return [];
	}
	return [title, ...lines];
}
