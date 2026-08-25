import type { Document, Element } from "@xmldom/xmldom";
import type { Tuplet, Voice, VoiceEvent } from "../model/score";
import { ChordWriter } from "./elements/chord-writer";
import { RestWriter } from "./elements/rest-writer";
import { TupletWriter } from "./elements/tuplet-writer";
import { children } from "./score-dom";

export class VoiceWriter {
	private readonly chordWriter: ChordWriter;
	private readonly restWriter: RestWriter;
	private readonly tupletWriter: TupletWriter;

	constructor(
		private readonly document: Document,
		private readonly voiceElement: Element,
	) {
		this.chordWriter = new ChordWriter(document);
		this.restWriter = new RestWriter(document);
		this.tupletWriter = new TupletWriter(document);
	}

	write(voice: Voice): void {
		this.removeContent();
		voice.events.forEach((event) => {
			this.writeEvent(event);
		});
	}

	private writeEvent(event: VoiceEvent): void {
		switch (event.kind) {
			case "chord":
				this.voiceElement.appendChild(this.chordWriter.write(event));
				break;
			case "rest":
				this.voiceElement.appendChild(this.restWriter.write(event));
				break;
			case "tuplet":
				this.writeTuplet(event);
				break;
		}
	}

	private writeTuplet(tuplet: Tuplet): void {
		this.voiceElement.appendChild(this.tupletWriter.write(tuplet));
		tuplet.events.forEach((event) => {
			this.writeEvent(event);
		});
		this.voiceElement.appendChild(this.document.createElement("endTuplet"));
	}

	private removeContent(): void {
		const content = [
			...children(this.voiceElement, "Chord"),
			...children(this.voiceElement, "Rest"),
			...children(this.voiceElement, "Tuplet"),
			...children(this.voiceElement, "endTuplet"),
		];
		content.forEach((element) => {
			this.voiceElement.removeChild(element);
		});
	}
}
