import type { Document, Element } from "@xmldom/xmldom";
import type Fraction from "fraction.js";
import { ENCLOSURE_SPANNERS, type EnclosureName } from "../../model/enclosures";
import type { Chord } from "../../model/score";
import { children } from "../score-dom";
import { appendLocationElement, negateSpanLocation, type SpanLocation, spanLocation } from "./spanner-location";

interface PendingStart {
	name: EnclosureName;
	element: Element;
	position: Fraction;
	barOffset: number;
}

export class EnclosureWriter {
	private pendingStart: PendingStart | undefined;

	constructor(private readonly document: Document) {}

	onChord(chord: Chord, element: Element, position: Fraction): void {
		if (this.pendingStart && chord.closesEnclosure === this.pendingStart.name) {
			const location = spanLocation(this.pendingStart.barOffset, this.pendingStart.position, position);
			this.insertSpanner(this.pendingStart.name, this.pendingStart.element, "next", location, true);
			this.insertSpanner(this.pendingStart.name, element, "prev", negateSpanLocation(location), false);
			this.pendingStart = undefined;
		}
		if (chord.opensEnclosure) {
			this.pendingStart = { name: chord.opensEnclosure, element, position, barOffset: 0 };
		}
	}

	startBar(): void {
		if (this.pendingStart) {
			this.pendingStart = { ...this.pendingStart, barOffset: this.pendingStart.barOffset + 1 };
		}
	}

	finalize(): void {
		this.pendingStart = undefined;
	}

	private insertSpanner(
		name: EnclosureName,
		chordElement: Element,
		direction: "next" | "prev",
		location: SpanLocation,
		withInnerElement: boolean,
	): void {
		const spannerType = ENCLOSURE_SPANNERS[name];
		const spanner = this.document.createElement("Spanner");
		spanner.setAttribute("type", spannerType);
		if (withInnerElement) {
			spanner.appendChild(this.document.createElement(spannerType));
		}
		const endpoint = this.document.createElement(direction);
		appendLocationElement(this.document, endpoint, location);
		spanner.appendChild(endpoint);
		chordElement.insertBefore(spanner, children(chordElement, "Note")[0]!);
	}
}
