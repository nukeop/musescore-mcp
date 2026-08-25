import type { Document, Element } from "@xmldom/xmldom";
import type { Chord } from "../../model/score";
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
		chord.notes.forEach((note) => {
			element.appendChild(this.noteWriter.write(note));
		});
		return element;
	}
}
