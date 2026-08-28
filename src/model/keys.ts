export type KeyName =
	| "C♭"
	| "G♭"
	| "D♭"
	| "A♭"
	| "E♭"
	| "B♭"
	| "F"
	| "C"
	| "G"
	| "D"
	| "A"
	| "E"
	| "B"
	| "F♯"
	| "C♯"
	| "A♭m"
	| "E♭m"
	| "B♭m"
	| "Fm"
	| "Cm"
	| "Gm"
	| "Dm"
	| "Am"
	| "Em"
	| "Bm"
	| "F♯m"
	| "C♯m"
	| "G♯m"
	| "D♯m"
	| "A♯m";

export const KEY_NAMES: [KeyName, ...KeyName[]] = [
	"C♭",
	"G♭",
	"D♭",
	"A♭",
	"E♭",
	"B♭",
	"F",
	"C",
	"G",
	"D",
	"A",
	"E",
	"B",
	"F♯",
	"C♯",
	"A♭m",
	"E♭m",
	"B♭m",
	"Fm",
	"Cm",
	"Gm",
	"Dm",
	"Am",
	"Em",
	"Bm",
	"F♯m",
	"C♯m",
	"G♯m",
	"D♯m",
	"A♯m",
];

export const KEY_FIFTHS: Record<KeyName, number> = {
	"C♭": -7,
	"G♭": -6,
	"D♭": -5,
	"A♭": -4,
	"E♭": -3,
	"B♭": -2,
	F: -1,
	C: 0,
	G: 1,
	D: 2,
	A: 3,
	E: 4,
	B: 5,
	"F♯": 6,
	"C♯": 7,
	"A♭m": -7,
	"E♭m": -6,
	"B♭m": -5,
	Fm: -4,
	Cm: -3,
	Gm: -2,
	Dm: -1,
	Am: 0,
	Em: 1,
	Bm: 2,
	"F♯m": 3,
	"C♯m": 4,
	"G♯m": 5,
	"D♯m": 6,
	"A♯m": 7,
};

export function keyName(fifths: number): string {
	return KEY_NAMES.filter((name) => KEY_FIFTHS[name] === fifths).join("/");
}

type Transposition = { diatonic: number; chromatic: number };

function keyOffset(transposition: Transposition | undefined): number {
	if (!transposition) {
		return 0;
	}
	return 7 * transposition.chromatic - 12 * transposition.diatonic;
}

export function actualKey(concertKey: number, transposition: Transposition | undefined): number {
	return concertKey - keyOffset(transposition);
}

export function concertKey(writtenKey: number, transposition: Transposition | undefined): number {
	return writtenKey + keyOffset(transposition);
}
