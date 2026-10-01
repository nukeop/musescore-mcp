import type { Harmony } from "../model/score";
import { WrittenPitch } from "../model/written-pitch";

export function chordSymbol(harmony: Harmony): string {
	return `${noteName(harmony.root)}${harmony.name}${slashBass(harmony.base)}`;
}

function slashBass(base: number | undefined): string {
	if (base === undefined) {
		return "";
	}
	return `/${noteName(base)}`;
}

function noteName(tpc: number): string {
	const pitch = WrittenPitch.fromTpc(tpc);
	return `${pitch.letter}${pitch.accidental}`;
}
