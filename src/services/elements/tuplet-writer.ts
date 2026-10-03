import type { Document, Element } from "@xmldom/xmldom";
import type { Tuplet } from "../../model/score";
import { tupletBaseNote } from "../../model/tuplets";
import { elementWithText } from "../score-dom";

export class TupletWriter {
	constructor(private readonly document: Document) {}

	write(tuplet: Tuplet): Element {
		const element = this.document.createElement("Tuplet");
		element.appendChild(elementWithText(this.document, "normalNotes", String(tuplet.normalNotes)));
		element.appendChild(elementWithText(this.document, "actualNotes", String(tuplet.actualNotes)));
		element.appendChild(elementWithText(this.document, "baseNote", tupletBaseNote(tuplet)));
		element.appendChild(this.writeNumber(tuplet));
		return element;
	}

	private writeNumber(tuplet: Tuplet): Element {
		const element = this.document.createElement("Number");
		element.appendChild(elementWithText(this.document, "style", "tuplet"));
		element.appendChild(elementWithText(this.document, "text", String(tuplet.actualNotes)));
		return element;
	}
}
