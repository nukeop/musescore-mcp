import type { Document, Element } from "@xmldom/xmldom";
import type Fraction from "fraction.js";
import type { Chord } from "../../model/score";
import { children, elementWithText } from "../score-dom";

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
			const location = { measures: last.barOffset, fractions: position.sub(last.position) };
			const negated = { measures: -location.measures, fractions: location.fractions.neg() };
			this.appendStartSpanners(last, location);
			this.appendEndSpanners(chord, element, last, negated);
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
		const location = { measures: this.lastChord.barOffset + 1, fractions: this.lastChord.position.neg() };
		this.appendStartSpanners(this.lastChord, location);
		this.lastChord = undefined;
	}

	private appendStartSpanners(last: LastChord, location: { measures: number; fractions: Fraction }): void {
		const noteElements = children(last.element, "Note");
		last.chord.notes.forEach((note, index) => {
			if (note.tied) {
				this.insertSpanner(noteElements[index]!, "next", location);
			}
		});
	}

	private appendEndSpanners(
		chord: Chord,
		element: Element,
		last: LastChord,
		location: { measures: number; fractions: Fraction },
	): void {
		const noteElements = children(element, "Note");
		last.chord.notes.forEach((note) => {
			if (!note.tied) {
				return;
			}
			const targetIndex = chord.notes.findIndex((n) => n.pitch === note.pitch);
			if (targetIndex >= 0) {
				this.insertSpanner(noteElements[targetIndex]!, "prev", location);
			}
		});
	}

	private insertSpanner(
		noteElement: Element,
		direction: "next" | "prev",
		location: { measures: number; fractions: Fraction },
	): void {
		const spanner = this.document.createElement("Spanner");
		spanner.setAttribute("type", "Tie");
		if (direction === "next") {
			spanner.appendChild(this.document.createElement("Tie"));
		}
		const endpoint = this.document.createElement(direction);
		const locationElement = this.document.createElement("location");
		if (location.measures !== 0) {
			locationElement.appendChild(elementWithText(this.document, "measures", String(location.measures)));
		}
		locationElement.appendChild(elementWithText(this.document, "fractions", location.fractions.toFraction()));
		endpoint.appendChild(locationElement);
		spanner.appendChild(endpoint);
		noteElement.insertBefore(spanner, noteElement.firstChild);
	}
}
