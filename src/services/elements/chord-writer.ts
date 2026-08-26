import type { Document, Element } from "@xmldom/xmldom";
import { ANNOTATIONS, type Annotation } from "../../model/annotations";
import type { Chord } from "../../model/score";
import { elementWithText } from "../score-dom";
import { appendDuration } from "./duration";
import { NoteWriter } from "./note-writer";

export class ChordWriter {
	private readonly noteWriter: NoteWriter;

	constructor(private readonly document: Document) {
		this.noteWriter = new NoteWriter(document);
	}

	write(chord: Chord): Element {
		const element = this.document.createElement("Chord");
		appendDuration(this.document, element, chord.duration);

		if (chord.grace) {
			element.appendChild(this.document.createElement("acciaccatura"));
		}

		const annotation = chord.annotation ? ANNOTATIONS[chord.annotation] : undefined;
		if (annotation?.xmlParent === "chord") {
			element.appendChild(this.createAnnotationElement(annotation));
		}

		const noteElements = chord.notes.map((note) => this.noteWriter.write(note));
		noteElements.forEach((noteElement) => {
			element.appendChild(noteElement);
		});

		if (annotation?.xmlParent === "note") {
			noteElements.forEach((noteElement) => {
				noteElement.appendChild(this.createAnnotationElement(annotation));
			});
		}

		return element;
	}

	private createAnnotationElement(annotation: Annotation): Element {
		const element = this.document.createElement(annotation.xmlElement);
		element.appendChild(elementWithText(this.document, "subtype", annotation.xmlSubtype));
		return element;
	}
}
