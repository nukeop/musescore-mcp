import type { Document, Element } from "@xmldom/xmldom";
import type { Chord, Voice, VoiceEvent } from "../model/score";
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

	write(voice: Voice, previousChord: Chord | undefined): Chord | undefined {
		this.removeContent();
		return voice.events.reduce(
			(previousChord, event) => this.writeEvent(event, previousChord),
			previousChord,
		);
	}

	private writeEvent(event: VoiceEvent, previousChord: Chord | undefined): Chord | undefined {
		switch (event.kind) {
			case "chord":
				this.voiceElement.appendChild(this.chordWriter.write(event));
				return event;
			case "rest":
				this.voiceElement.appendChild(this.restWriter.write(event));
				return undefined;
			case "tuplet":
				this.voiceElement.appendChild(this.tupletWriter.write(event));
				event.events.forEach((member) => {
					this.writeEvent(member, undefined);
				});
				this.voiceElement.appendChild(this.document.createElement("endTuplet"));
				return undefined;
		}
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
