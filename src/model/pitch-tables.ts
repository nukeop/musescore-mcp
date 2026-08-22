export type Letter = "C" | "D" | "E" | "F" | "G" | "A" | "B";
export type Accidental = "" | "♭" | "♭♭" | "♯" | "♯♯";

export const LETTERS: Letter[] = ["C", "D", "E", "F", "G", "A", "B"];
export const ACCIDENTALS: Accidental[] = ["", "♭", "♭♭", "♯", "♯♯"];

export const NATURAL_TPC: Record<Letter, number> = {
	F: 13,
	C: 14,
	G: 15,
	D: 16,
	A: 17,
	E: 18,
	B: 19,
};

export const NATURAL_PITCH_CLASS: Record<Letter, number> = {
	C: 0,
	D: 2,
	E: 4,
	F: 5,
	G: 7,
	A: 9,
	B: 11,
};

export const ACCIDENTAL_SEMITONES: Record<Accidental, number> = {
	"": 0,
	"♭": -1,
	"♭♭": -2,
	"♯": 1,
	"♯♯": 2,
};

export function isLetter(value: string): value is Letter {
	return value in NATURAL_TPC;
}

export function isAccidental(value: string): value is Accidental {
	return value in ACCIDENTAL_SEMITONES;
}

export function letterWithNaturalTpc(naturalTpc: number): Letter {
	const letter = LETTERS.find((candidate) => NATURAL_TPC[candidate] === naturalTpc);
	if (!letter) {
		throw new Error(`No letter with natural tpc ${naturalTpc}`);
	}
	return letter;
}

export function accidentalWithSemitones(semitones: number): Accidental {
	const accidental = ACCIDENTALS.find(
		(candidate) => ACCIDENTAL_SEMITONES[candidate] === semitones,
	);
	if (accidental === undefined) {
		throw new Error(`No accidental with ${semitones} semitones`);
	}
	return accidental;
}
