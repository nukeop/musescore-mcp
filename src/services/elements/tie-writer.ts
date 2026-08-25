import type { Document, Element } from "@xmldom/xmldom";
import type Fraction from "fraction.js";
import { elementWithText } from "../score-dom";

export class TieWriter {
	constructor(private readonly document: Document) {}

	startSpanner(fractions: Fraction): Element {
		const spanner = this.document.createElement("Spanner");
		spanner.setAttribute("type", "Tie");
		spanner.appendChild(this.document.createElement("Tie"));
		const next = this.document.createElement("next");
		const location = this.document.createElement("location");
		location.appendChild(elementWithText(this.document, "fractions", fractions.toFraction()));
		next.appendChild(location);
		spanner.appendChild(next);
		return spanner;
	}
}
