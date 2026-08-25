import type { Document, Element } from "@xmldom/xmldom";
import type { Tuplet } from "../../model/score";
import { elementWithText } from "../score-dom";

export class TupletWriter {
	constructor(private readonly document: Document) {}

	write(tuplet: Tuplet): Element {
		const element = this.document.createElement("Tuplet");
		element.appendChild(elementWithText(this.document, "normalNotes", String(tuplet.normalNotes)));
		element.appendChild(elementWithText(this.document, "actualNotes", String(tuplet.actualNotes)));
		return element;
	}
}
