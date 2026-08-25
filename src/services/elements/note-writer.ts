import type { Document, Element } from "@xmldom/xmldom";
import type { Note } from "../../model/score";
import { elementWithText } from "../score-dom";

export class NoteWriter {
	constructor(private readonly document: Document) {}

	write(note: Note): Element {
		const element = this.document.createElement("Note");
		element.appendChild(elementWithText(this.document, "pitch", String(note.pitch)));
		element.appendChild(elementWithText(this.document, "tpc", String(note.tpc)));
		if (note.tpc2 !== undefined) {
			element.appendChild(elementWithText(this.document, "tpc2", String(note.tpc2)));
		}
		return element;
	}
}
