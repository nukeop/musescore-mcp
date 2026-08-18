export const KEY_FIFTHS = {
	Cb: -7,
	Gb: -6,
	Db: -5,
	Ab: -4,
	Eb: -3,
	Bb: -2,
	F: -1,
	C: 0,
	G: 1,
	D: 2,
	A: 3,
	E: 4,
	B: 5,
	"F#": 6,
	"C#": 7,
	Abm: -7,
	Ebm: -6,
	Bbm: -5,
	Fm: -4,
	Cm: -3,
	Gm: -2,
	Dm: -1,
	Am: 0,
	Em: 1,
	Bm: 2,
	"F#m": 3,
	"C#m": 4,
	"G#m": 5,
	"D#m": 6,
	"A#m": 7,
} as const;

export type KeyName = keyof typeof KEY_FIFTHS;

export const keyNames = Object.keys(KEY_FIFTHS) as [KeyName, ...KeyName[]];

export function actualKey(
	concertKey: number,
	transposition: { diatonic: number; chromatic: number } | undefined,
): number {
	if (transposition === undefined) {
		return concertKey;
	}
	return concertKey - (7 * transposition.chromatic - 12 * transposition.diatonic);
}
