import {
	ACCIDENTAL_SEMITONES,
	type Accidental,
	accidentalWithSemitones,
	isAccidental,
	isLetter,
	type Letter,
	letterWithNaturalTpc,
	NATURAL_PITCH_CLASS,
	NATURAL_TPC,
} from "./pitch-tables";
import type { Note, ScorePart } from "./score";

export class WrittenPitch {
	private constructor(
		readonly letter: Letter,
		readonly accidental: Accidental,
		readonly octave: number,
	) {}

	static parse(name: string): WrittenPitch {
		const letter = name.charAt(0);
		const accidental = name.substring(1, name.length - 1);
		const octave = name.charAt(name.length - 1);

		if (!isLetter(letter) || !isAccidental(accidental) || !WrittenPitch.isOctave(octave)) {
			throw new Error(`Invalid note: ${name}`);
		}

		return new WrittenPitch(letter, accidental, Number(octave));
	}

	static fromTpc(tpc: number): WrittenPitch {
		const semitones = Math.floor((tpc + 1) / 7) - 2;
		const letter = letterWithNaturalTpc(tpc - 7 * semitones);
		const accidental = accidentalWithSemitones(semitones);
		return new WrittenPitch(letter, accidental, 0);
	}

	// Written pitch as it will be shown to AI. e.g. E♭5
	// Converts from Musescore XML to something AI-readable
	static fromNote(note: Note, part: ScorePart): WrittenPitch {
		const writtenTpc = note.tpc2 ?? note.tpc;
		const writtenMidi = note.pitch - part.transposeChromatic;
		const base = WrittenPitch.fromTpc(writtenTpc);
		const octave = Math.floor((writtenMidi - ACCIDENTAL_SEMITONES[base.accidental]) / 12) - 1;
		return new WrittenPitch(base.letter, base.accidental, octave);
	}

	// From written pitch (e.g. E♭5, 5 being the octave)
	// to a structured object. This helps us save it in the Musescore XML
	toNote(part: ScorePart): Note {
		const tpcShift = 7 * part.transposeChromatic - 12 * part.transposeDiatonic;
		const pitch = this.midi + part.transposeChromatic;
		const tpc = this.tpc + tpcShift;

		if (tpc === this.tpc) {
			return { pitch, tpc };
		}

		return { pitch, tpc, tpc2: this.tpc };
	}

	get tpc(): number {
		return NATURAL_TPC[this.letter] + 7 * ACCIDENTAL_SEMITONES[this.accidental];
	}

	get midi(): number {
		const naturalMidi = 12 * (this.octave + 1) + NATURAL_PITCH_CLASS[this.letter];
		return naturalMidi + ACCIDENTAL_SEMITONES[this.accidental];
	}

	get name(): string {
		return `${this.letter}${this.accidental}${this.octave}`;
	}

	private static isOctave(value: string): boolean {
		return value >= "0" && value <= "9";
	}
}
