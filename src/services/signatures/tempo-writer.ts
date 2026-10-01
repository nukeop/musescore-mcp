import type { Staff } from "../../model/score";
import { assertMeasureInRange, firstStaff, voiceAt } from "../measure-range";
import { replaceOrPrepend } from "../score-dom";
import type { ScoreFile } from "../score-file";
import { buildTempo } from "./tempo-element";

export class TempoWriter {
	constructor(
		private readonly scoreFile: ScoreFile,
		private readonly staves: Staff[],
	) {}

	set(measure: number, bpm: number): void {
		assertMeasureInRange(this.staves, measure, this.scoreFile.path);

		const voice = voiceAt(firstStaff(this.staves), measure);
		replaceOrPrepend(voice, buildTempo(this.scoreFile.document, bpm));
	}
}
