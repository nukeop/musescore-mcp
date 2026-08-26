import { ENCLOSURE_NAMES, type EnclosureName } from "../model/enclosures";
import type { Chord, Voice, VoiceEvent } from "../model/score";
import type { TokenCursor } from "./token-cursor";

export class EnclosureMarker {
	private readonly openNames: EnclosureName[] = [];

	constructor(private readonly cursor: TokenCursor) {}

	around(parseEvent: () => VoiceEvent): VoiceEvent {
		const opened = this.matchOpen();
		const event = parseEvent();
		if (event.kind !== "chord") {
			return event;
		}
		return this.markClose(this.markOpen(event, opened));
	}

	private matchOpen(): EnclosureName | undefined {
		const token = this.cursor.peek();
		if (token.kind !== "word") {
			return undefined;
		}
		const name = ENCLOSURE_NAMES.find((candidate) => candidate === token.text);
		if (!name) {
			return undefined;
		}
		this.cursor.expectWord();
		this.cursor.expect("lparen");
		this.openNames.push(name);
		return name;
	}

	private markOpen(chord: Chord, opened: EnclosureName | undefined): Chord {
		if (!opened) {
			return chord;
		}
		return { ...chord, opensEnclosure: opened };
	}

	private markClose(chord: Chord): Chord {
		let marked = chord;
		while (this.openNames.length > 0 && this.cursor.match("rparen")) {
			marked = { ...marked, closesEnclosure: this.openNames.pop() };
		}
		return marked;
	}
}

export function wrapInEnclosures(chord: Chord, text: string): string {
	if (chord.opensEnclosure) {
		return `${chord.opensEnclosure}(${text}`;
	}
	if (chord.closesEnclosure) {
		return `${text})`;
	}
	return text;
}

export function stripUnpairedEnclosures(voices: (Voice | undefined)[]): (Voice | undefined)[] {
	return ENCLOSURE_NAMES.reduce((current, name) => stripUnpaired(current, name), voices);
}

interface PairFold {
	open: Chord | undefined;
	paired: Chord[];
}

function stripUnpaired(voices: (Voice | undefined)[], name: EnclosureName): (Voice | undefined)[] {
	const chords = voices
		.flatMap((voice) => voice?.events ?? [])
		.filter((event): event is Chord => event.kind === "chord");
	const paired = pairedChords(chords, name);

	return voices.map((voice) => {
		if (!voice) {
			return voice;
		}
		return {
			events: voice.events.map((event) => {
				if (event.kind !== "chord" || paired.has(event)) {
					return event;
				}
				return clearMark(event, name);
			}),
		};
	});
}

function pairedChords(chords: Chord[], name: EnclosureName): Set<Chord> {
	const fold = chords.reduce<PairFold>(
		(state, chord) => {
			if (chord.opensEnclosure === name) {
				return { ...state, open: chord };
			}
			if (chord.closesEnclosure === name && state.open) {
				return { open: undefined, paired: [...state.paired, state.open, chord] };
			}
			return state;
		},
		{ open: undefined, paired: [] },
	);
	return new Set(fold.paired);
}

function clearMark(chord: Chord, name: EnclosureName): Chord {
	return {
		...chord,
		opensEnclosure: withoutName(chord.opensEnclosure, name),
		closesEnclosure: withoutName(chord.closesEnclosure, name),
	};
}

function withoutName(mark: EnclosureName | undefined, name: EnclosureName): EnclosureName | undefined {
	if (mark === name) {
		return undefined;
	}
	return mark;
}
