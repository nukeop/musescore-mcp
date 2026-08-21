import { keyName } from "../../model/keys";
import type { Score } from "../../model/score";

export class OverviewRenderer {
	constructor(private readonly score: Score) {}

	render(): string {
		const { title, composer } = this.score.header;
		return [`${title} by ${composer}`, this.signatureLine(), "Instruments:", ...this.instrumentLines()].join(
			"\n",
		);
	}

	private signatureLine(): string {
		const measures = this.score.staves[0]?.measures ?? [];
		const [first] = measures;
		const segments: string[] = [];
		if (first?.keySig) {
			segments.push(`Key: ${keyName(first.keySig.concertKey)}`);
		}
		if (first?.timeSig) {
			segments.push(`Time: ${first.timeSig.beats}/${first.timeSig.beatUnit}`);
		}
		if (first?.tempo) {
			segments.push(`Tempo: ${Math.round(first.tempo.quarterNotesPerSecond * 60)} bpm`);
		}
		segments.push(`Bars: ${measures.length}`);
		return segments.join(" | ");
	}

	private instrumentLines(): string[] {
		return this.score.parts.map((part, index) => `  ${index + 1}. ${part.name}`);
	}
}
