import { concertKey, keyName } from "../../model/keys";
import type { Measure, Score, ScoreHeader, ScorePart } from "../../model/score";
import { bpm } from "../../model/tempo";
import { chordLines } from "./chord-grid";
import { formLines } from "./form-lines";

export class OverviewRenderer {
	constructor(private readonly score: Score) {}

	render(): string {
		return [
			...headerLines(this.score.header),
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
			segments.push(`Key: ${keyName(first.keySig.writtenKey)}`);
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

	private concertKeyFifths(): number | undefined {
		const [first] = this.measures();
		const staff = this.score.staves[0];
		if (!first?.keySig || !staff) {
			return undefined;
		}
		return concertKey(first.keySig.writtenKey, {
			diatonic: staff.part.transposeDiatonic,
			chromatic: staff.part.transposeChromatic,
		});
	}

	private instrumentLines(): string[] {
		const concert = this.concertKeyFifths();
		return this.score.parts.map((part, index) => instrumentLine(part, index, concert));
	}
}

function instrumentLine(part: ScorePart, index: number, concert: number | undefined): string {
	if (!isTransposing(part) || concert === undefined) {
		return `  ${index + 1}. ${part.name}`;
	}
	return `  ${index + 1}. ${part.name} (concert ${keyName(concert)})`;
}

function isTransposing(part: ScorePart): boolean {
	return part.transposeDiatonic !== 0 || part.transposeChromatic !== 0;
}

function headerLines({ title, composer }: ScoreHeader): string[] {
	if (title && composer) {
		return [`${title} by ${composer}`];
	}
	if (title) {
		return [title];
	}
	if (composer) {
		return [`by ${composer}`];
	}
	return [];
}

function section(title: string, lines: string[]): string[] {
	if (lines.length === 0) {
		return [];
	}
	return [title, ...lines];
}
