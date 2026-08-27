import type { Staff } from "../../model/score";
import { child, replaceOrPrepend } from "../score-dom";
import type { ScoreFile } from "../score-file";
import { assertMeasureInRange } from "./measure-range";
import { buildTempo } from "./tempo-element";

export class TempoWriter {
	constructor(
		private readonly scoreFile: ScoreFile,
		private readonly staves: Staff[],
	) {}

	set(measure: number, bpm: number): void {
		assertMeasureInRange(this.staves, measure, this.scoreFile.path);

		const voice = child(this.staves[0]!.measures[measure - 1]!.element, "voice")!;
		replaceOrPrepend(voice, buildTempo(this.scoreFile.document, bpm));
	}
}
