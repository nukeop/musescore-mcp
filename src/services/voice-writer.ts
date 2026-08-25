import type { Document, Element } from "@xmldom/xmldom";
import Fraction from "fraction.js";
import { eventDuration } from "../model/bar-fill";
import type { Harmony, Voice, VoiceEvent } from "../model/score";
import { ChordWriter } from "./elements/chord-writer";
import { RestWriter } from "./elements/rest-writer";
import type { TieWriter } from "./elements/tie-writer";
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

	write(voice: Voice, measureLength: Fraction, tieWriter: TieWriter): void {
		this.removeContent();
		voice.events.reduce(
			(position, event) => this.writeEvent(event, position, measureLength, tieWriter),
			new Fraction(0),
		);
	}

	private writeEvent(
		event: VoiceEvent,
		position: Fraction,
		measureLength: Fraction,
		tieWriter: TieWriter,
	): Fraction {
		const nextPosition = position.add(eventDuration(event, measureLength));
		switch (event.kind) {
			case "chord": {
				this.appendHarmony(event.harmony);
				const element = this.chordWriter.write(event);
				this.voiceElement.appendChild(element);
				tieWriter.endTie(event, element, position);
				break;
			}
			case "rest":
				this.appendHarmony(event.harmony);
				this.voiceElement.appendChild(this.restWriter.write(event));
				tieWriter.clear();
				break;
			case "tuplet":
				this.voiceElement.appendChild(this.tupletWriter.write(event));
				event.events.forEach((member) => {
					this.writeEvent(member, position, measureLength, tieWriter);
				});
				this.voiceElement.appendChild(this.document.createElement("endTuplet"));
				break;
		}
		return nextPosition;
	}

	private appendHarmony(harmony: Harmony | undefined): void {
		if (!harmony) {
			return;
		}
		const element = this.document.createElement("Harmony");
		const root = this.document.createElement("root");
		root.textContent = String(harmony.root);
		const name = this.document.createElement("name");
		name.textContent = harmony.name;
		element.appendChild(root);
		element.appendChild(name);
		this.voiceElement.appendChild(element);
	}

	private removeContent(): void {
		const content = [
			...children(this.voiceElement, "Harmony"),
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
