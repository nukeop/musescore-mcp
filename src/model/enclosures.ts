import type { Chord, Voice } from "./score";

export const ENCLOSURE_NAMES = ["slur"] as const;

export type EnclosureName = (typeof ENCLOSURE_NAMES)[number];

export const ENCLOSURE_SPANNERS: Record<EnclosureName, string> = {
	slur: "Slur",
};

interface OpenEnclosure {
	name: EnclosureName;
	chordCount: number;
}

export function validateEnclosures(bars: Voice[]): void {
	const chords = bars.flatMap((bar) => bar.events).filter((event): event is Chord => event.kind === "chord");
	const open = chords.reduce<OpenEnclosure | undefined>(validateChord, undefined);
	if (open) {
		throw new Error(`Unclosed ${open.name}`);
	}
}

function validateChord(state: OpenEnclosure | undefined, chord: Chord): OpenEnclosure | undefined {
	if (chord.opensEnclosure && state) {
		throw new Error(`Nested ${chord.opensEnclosure}`);
	}
	if (chord.opensEnclosure) {
		return closeIfMarked(chord, { name: chord.opensEnclosure, chordCount: 1 });
	}
	if (!state) {
		return undefined;
	}
	return closeIfMarked(chord, { ...state, chordCount: state.chordCount + 1 });
}

function closeIfMarked(chord: Chord, state: OpenEnclosure): OpenEnclosure | undefined {
	if (!chord.closesEnclosure) {
		return state;
	}
	if (state.chordCount < 2) {
		const label = state.name.charAt(0).toUpperCase() + state.name.slice(1);
		throw new Error(`${label} must contain at least two notes`);
	}
	return undefined;
}
