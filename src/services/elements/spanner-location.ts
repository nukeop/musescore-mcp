import type { Document, Element } from "@xmldom/xmldom";
import type Fraction from "fraction.js";
import { elementWithText } from "../score-dom";

export interface SpanLocation {
	measures: number;
	fractions: Fraction;
}

export function spanLocation(barOffset: number, fromPosition: Fraction, toPosition: Fraction): SpanLocation {
	return { measures: barOffset, fractions: toPosition.sub(fromPosition) };
}

export function negateSpanLocation(location: SpanLocation): SpanLocation {
	return { measures: -location.measures, fractions: location.fractions.neg() };
}

export function appendLocationElement(document: Document, parent: Element, location: SpanLocation): void {
	const locationElement = document.createElement("location");
	if (location.measures !== 0) {
		locationElement.appendChild(elementWithText(document, "measures", String(location.measures)));
	}
	locationElement.appendChild(elementWithText(document, "fractions", location.fractions.toFraction()));
	parent.appendChild(locationElement);
}
