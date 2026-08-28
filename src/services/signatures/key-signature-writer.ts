import { KEY_FIFTHS, type KeyName } from "../../model/keys";
import type { Staff } from "../../model/score";
import { child, replaceOrPrepend } from "../score-dom";
import type { ScoreFile } from "../score-file";
import { buildKeySig } from "./key-signature-element";
import { assertMeasureInRange } from "../measure-range";

export class KeySignatureWriter {
	constructor(
		private readonly scoreFile: ScoreFile,
		private readonly staves: Staff[],
	) {}

	set(measure: number, key: KeyName): void {
		assertMeasureInRange(this.staves, measure, this.scoreFile.path);

		this.staves.forEach((staff) => {
			const voice = child(staff.measures[measure - 1]!.element, "voice")!;
			const transposition = {
				diatonic: staff.part.transposeDiatonic,
				chromatic: staff.part.transposeChromatic,
			};
			replaceOrPrepend(voice, buildKeySig(this.scoreFile.document, KEY_FIFTHS[key], transposition));
		});
	}
}
