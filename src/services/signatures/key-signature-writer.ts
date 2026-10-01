import { concertKey, KEY_FIFTHS, type KeyName } from "../../model/keys";
import type { Staff } from "../../model/score";
import { assertMeasureInRange, firstStaff, voiceAt } from "../measure-range";
import { replaceOrPrepend } from "../score-dom";
import type { ScoreFile } from "../score-file";
import { buildKeySig } from "./key-signature-element";

export class KeySignatureWriter {
	constructor(
		private readonly scoreFile: ScoreFile,
		private readonly staves: Staff[],
	) {}

	set(measure: number, key: KeyName): void {
		assertMeasureInRange(this.staves, measure, this.scoreFile.path);

		const concert = this.concertKeyFifths(key);
		this.staves.forEach((staff) => {
			const voice = voiceAt(staff, measure);
			const transposition = {
				diatonic: staff.part.transposeDiatonic,
				chromatic: staff.part.transposeChromatic,
			};
			replaceOrPrepend(voice, buildKeySig(this.scoreFile.document, concert, transposition));
		});
	}

	private concertKeyFifths(key: KeyName): number {
		const { part } = firstStaff(this.staves);
		return concertKey(KEY_FIFTHS[key], {
			diatonic: part.transposeDiatonic,
			chromatic: part.transposeChromatic,
		});
	}
}
