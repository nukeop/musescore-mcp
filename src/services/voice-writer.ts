import type { Document, Element } from "@xmldom/xmldom";
import type { Chord, Duration, Note, Rest, Voice, VoiceEvent } from "../model/score";
import { children, elementWithText } from "./score-dom";

export class VoiceWriter {
	constructor(
		private readonly document: Document,
		private readonly voiceElement: Element,
	) {}

	write(voice: Voice): void {
		this.removeContent();
		voice.events.forEach((event) => {
			this.writeEvent(event);
		});
	}

	private writeEvent(event: VoiceEvent): void {
		switch (event.kind) {
			case "chord":
				this.voiceElement.appendChild(this.chordElement(event));
				break;
			case "rest":
				this.voiceElement.appendChild(this.restElement(event));
				break;
		}
	}

	private chordElement(chord: Chord): Element {
		const element = this.document.createElement("Chord");
		this.appendDuration(element, chord.duration);
		chord.notes.forEach((note) => {
			element.appendChild(this.noteElement(note));
		});
		return element;
	}

	private restElement(rest: Rest): Element {
		const element = this.document.createElement("Rest");
		this.appendDuration(element, rest.duration);
		return element;
	}

	private appendDuration(parent: Element, duration: Duration): void {
		if (duration.dots > 0) {
			parent.appendChild(elementWithText(this.document, "dots", String(duration.dots)));
		}
		parent.appendChild(elementWithText(this.document, "durationType", duration.type));
	}

	private noteElement(note: Note): Element {
		const element = this.document.createElement("Note");
		element.appendChild(elementWithText(this.document, "pitch", String(note.pitch)));
		element.appendChild(elementWithText(this.document, "tpc", String(note.tpc)));
		if (note.tpc2 !== undefined) {
			element.appendChild(elementWithText(this.document, "tpc2", String(note.tpc2)));
		}
		return element;
	}

	private removeContent(): void {
		const content = [...children(this.voiceElement, "Chord"), ...children(this.voiceElement, "Rest")];
		content.forEach((element) => {
			this.voiceElement.removeChild(element);
		});
	}
}
