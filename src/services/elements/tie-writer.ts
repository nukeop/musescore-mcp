import type { Document, Element } from "@xmldom/xmldom";
import type Fraction from "fraction.js";
import { elementWithText } from "../score-dom";

export class TieWriter {
	constructor(private readonly document: Document) {}

	startSpanner(fractions: Fraction): Element {
		const spanner = this.spannerElement();
		spanner.appendChild(this.document.createElement("Tie"));
		spanner.appendChild(this.endpoint("next", fractions));
		return spanner;
	}

	endSpanner(fractions: Fraction): Element {
		const spanner = this.spannerElement();
		spanner.appendChild(this.endpoint("prev", fractions));
		return spanner;
	}

	private spannerElement(): Element {
		const spanner = this.document.createElement("Spanner");
		spanner.setAttribute("type", "Tie");
		return spanner;
	}

	private endpoint(name: "next" | "prev", fractions: Fraction): Element {
		const endpoint = this.document.createElement(name);
		const location = this.document.createElement("location");
		location.appendChild(elementWithText(this.document, "fractions", fractions.toFraction()));
		endpoint.appendChild(location);
		return endpoint;
	}
}
