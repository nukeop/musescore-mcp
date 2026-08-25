import type { Document, Element } from "@xmldom/xmldom";
import type Fraction from "fraction.js";
import { durationFraction } from "../../model/duration-tables";
import type { Duration, Note } from "../../model/score";
import { elementWithText } from "../score-dom";
import { TieWriter } from "./tie-writer";

export class NoteWriter {
	private readonly tieWriter: TieWriter;

	constructor(private readonly document: Document) {
		this.tieWriter = new TieWriter(document);
	}

	write(note: Note, duration: Duration, tieFrom: Fraction | undefined): Element {
		const element = this.document.createElement("Note");
		if (note.tied && duration.type !== "measure") {
			element.appendChild(this.tieWriter.startSpanner(durationFraction(duration.type, duration.dots)));
		}
		if (tieFrom) {
			element.appendChild(this.tieWriter.endSpanner(tieFrom));
		}
		element.appendChild(elementWithText(this.document, "pitch", String(note.pitch)));
		element.appendChild(elementWithText(this.document, "tpc", String(note.tpc)));
		if (note.tpc2 !== undefined) {
			element.appendChild(elementWithText(this.document, "tpc2", String(note.tpc2)));
		}
		return element;
	}
}
