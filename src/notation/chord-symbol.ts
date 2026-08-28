import type { Harmony } from "../model/score";
import { WrittenPitch } from "../model/written-pitch";

export function chordSymbol(harmony: Harmony): string {
	const root = WrittenPitch.fromTpc(harmony.root);
	return `${root.letter}${root.accidental}${harmony.name}`;
}
