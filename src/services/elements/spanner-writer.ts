import type { Document, Element } from "@xmldom/xmldom";
import Fraction from "fraction.js";
import type { Chord, Note } from "../../model/score";
import { children, elementWithText } from "../score-dom";
import { appendLocationElement, negateSpanLocation, type SpanLocation, spanLocation } from "./spanner-location";

interface MarkedNote {
	note: Note;
	index: number;
}

interface SpannerKind {
	type: string;
	isMarked: (note: Note) => boolean;
	targetIndex: (marked: MarkedNote, targetChord: Chord) => number | undefined;
	createInnerElement: (document: Document) => Element;
}

const TIE: SpannerKind = {
	type: "Tie",
	isMarked: (note) => note.tied ?? false,
	targetIndex: (marked, chord) => {
		const index = chord.notes.findIndex((note) => note.pitch === marked.note.pitch);
		return index >= 0 ? index : undefined;
	},
	createInnerElement: (document) => document.createElement("Tie"),
};

const GLISSANDO: SpannerKind = {
	type: "Glissando",
	isMarked: (note) => note.glissando ?? false,
	targetIndex: (marked, chord) => (marked.index < chord.notes.length ? marked.index : undefined),
	createInnerElement: (document) => {
		const element = document.createElement("Glissando");
		element.appendChild(elementWithText(document, "subtype", "1"));
		element.appendChild(elementWithText(document, "diagonal", "1"));
		return element;
	},
};

const SPANNER_KINDS: SpannerKind[] = [TIE, GLISSANDO];

interface LastChord {
	chord: Chord;
	element: Element;
	position: Fraction;
	barOffset: number;
}

export class SpannerWriter {
	private lastChord: LastChord | undefined;

	constructor(private readonly document: Document) {}

	onChord(chord: Chord, element: Element, position: Fraction): void {
		const last = this.lastChord;
		if (last) {
			const location = spanLocation(last.barOffset, last.position, position);
			this.appendStartSpanners(last, location);
			this.appendEndSpanners(chord, element, last, negateSpanLocation(location));
		}
		this.lastChord = { chord, element, position, barOffset: 0 };
	}

	clear(): void {
		this.lastChord = undefined;
	}

	startBar(): void {
		if (this.lastChord) {
			this.lastChord = { ...this.lastChord, barOffset: this.lastChord.barOffset + 1 };
		}
	}

	finalize(): void {
		if (!this.lastChord) {
			return;
		}
		const location = spanLocation(this.lastChord.barOffset + 1, this.lastChord.position, new Fraction(0));
		this.appendStartSpanners(this.lastChord, location);
		this.lastChord = undefined;
	}

	private appendStartSpanners(last: LastChord, location: SpanLocation): void {
		const noteElements = children(last.element, "Note");
		for (const kind of SPANNER_KINDS) {
			last.chord.notes.forEach((note, index) => {
				if (kind.isMarked(note)) {
					this.insertSpanner(noteElements[index]!, "next", location, kind);
				}
			});
		}
	}

	private appendEndSpanners(chord: Chord, element: Element, last: LastChord, location: SpanLocation): void {
		const noteElements = children(element, "Note");
		for (const kind of SPANNER_KINDS) {
			last.chord.notes.forEach((note, index) => {
				if (!kind.isMarked(note)) {
					return;
				}
				const targetIndex = kind.targetIndex({ note, index }, chord);
				if (targetIndex !== undefined) {
					this.insertSpanner(noteElements[targetIndex]!, "prev", location, kind);
				}
			});
		}
	}

	private insertSpanner(
		noteElement: Element,
		direction: "next" | "prev",
		location: SpanLocation,
		kind: SpannerKind,
	): void {
		const spanner = this.document.createElement("Spanner");
		spanner.setAttribute("type", kind.type);
		if (direction === "next") {
			spanner.appendChild(kind.createInnerElement(this.document));
		}
		const endpoint = this.document.createElement(direction);
		appendLocationElement(this.document, endpoint, location);
		spanner.appendChild(endpoint);
		noteElement.insertBefore(spanner, noteElement.firstChild);
	}
}
