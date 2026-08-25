import type { Document, Element } from "@xmldom/xmldom";
import type Fraction from "fraction.js";
import { durationFraction } from "../../model/duration-tables";
import type { Chord, Note } from "../../model/score";
import { appendDuration } from "./duration";
import { NoteWriter } from "./note-writer";

export class ChordWriter {
	private readonly noteWriter: NoteWriter;

	constructor(private readonly document: Document) {
		this.noteWriter = new NoteWriter(document);
	}

	write(chord: Chord, previousChord: Chord | undefined): Element {
		const element = this.document.createElement("Chord");
		appendDuration(this.document, element, chord.duration);
		chord.notes.forEach((note) => {
			element.appendChild(this.noteWriter.write(note, chord.duration, tieFrom(note, previousChord)));
		});
		return element;
	}
}

function tieFrom(note: Note, previousChord: Chord | undefined): Fraction | undefined {
	if (!previousChord || previousChord.duration.type === "measure") {
		return undefined;
	}
	const tiedToNote = previousChord.notes.some(
		(candidate) => candidate.tied && candidate.pitch === note.pitch,
	);
	if (!tiedToNote) {
		return undefined;
	}
	return durationFraction(previousChord.duration.type, previousChord.duration.dots).neg();
}
