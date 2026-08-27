import { KEY_FIFTHS, type KeyName } from "../../model/keys";
import type { Staff } from "../../model/score";
import { child } from "../score-dom";
import type { ScoreFile } from "../score-file";
import { buildKeySig } from "./key-signature-element";

export class KeySignatureWriter {
	constructor(
		private readonly scoreFile: ScoreFile,
		private readonly staves: Staff[],
	) {}

	set(measure: number, key: KeyName): void {
		this.assertInRange(measure);

		this.staves.forEach((staff) => {
			const voice = child(staff.measures[measure - 1]!.element, "voice")!;
			const transposition = {
				diatonic: staff.part.transposeDiatonic,
				chromatic: staff.part.transposeChromatic,
			};
			const keySig = buildKeySig(this.scoreFile.document, KEY_FIFTHS[key], transposition);
			const existing = child(voice, "KeySig");
			if (existing) {
				voice.replaceChild(keySig, existing);
			} else {
				voice.insertBefore(keySig, voice.firstChild);
			}
		});
	}

	private assertInRange(measure: number): void {
		const length = this.staves[0]?.measures.length ?? 0;
		if (measure > length) {
			throw new Error(`Measure ${measure} exceeds score length (${length} measures): ${this.scoreFile.path}`);
		}
	}
}
