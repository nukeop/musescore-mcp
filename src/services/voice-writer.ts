import type { Document, Element } from "@xmldom/xmldom";
import Fraction from "fraction.js";
import { eventDuration } from "../model/bar-fill";
import type { Harmony, Voice, VoiceEvent } from "../model/score";
import { ChordWriter } from "./elements/chord-writer";
import { RestWriter } from "./elements/rest-writer";
import type { EnclosureWriter } from "./elements/enclosure-writer";
import type { SpannerWriter } from "./elements/spanner-writer";
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

	write(voice: Voice, measureLength: Fraction, spannerWriter: SpannerWriter, enclosureWriter: EnclosureWriter): void {
		this.removeContent();
		voice.events.reduce(
			(position, event) => this.writeEvent(event, position, measureLength, spannerWriter, enclosureWriter),
			new Fraction(0),
		);
		children(this.voiceElement, "BarLine").forEach((barLine) => {
			this.voiceElement.appendChild(barLine);
		});
	}

	private writeEvent(
		event: VoiceEvent,
		position: Fraction,
		measureLength: Fraction,
		spannerWriter: SpannerWriter,
		enclosureWriter: EnclosureWriter,
	): Fraction {
		const nextPosition = position.add(eventDuration(event, measureLength));
		switch (event.kind) {
			case "chord": {
				this.appendHarmony(event.harmony);
				const element = this.chordWriter.write(event);
				this.voiceElement.appendChild(element);
				spannerWriter.onChord(event, element, position);
				enclosureWriter.onChord(event, element, position);
				break;
			}
			case "rest":
				this.appendHarmony(event.harmony);
				this.voiceElement.appendChild(this.restWriter.write(event));
				spannerWriter.clear();
				break;
			case "tuplet":
				this.voiceElement.appendChild(this.tupletWriter.write(event));
				event.events.forEach((member) => {
					this.writeEvent(member, position, measureLength, spannerWriter, enclosureWriter);
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
