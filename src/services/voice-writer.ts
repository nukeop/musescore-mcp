import type { Document, Element } from "@xmldom/xmldom";
import Fraction from "fraction.js";
import { eventDuration } from "../model/bar-fill";
import type { Harmony, Voice, VoiceEvent } from "../model/score";
import { ChordWriter } from "./elements/chord-writer";
import type { EnclosureWriter } from "./elements/enclosure-writer";
import { RestWriter } from "./elements/rest-writer";
import type { SpannerWriter } from "./elements/spanner-writer";
import { TupletWriter } from "./elements/tuplet-writer";
import { childElements, children, elementWithText } from "./score-dom";

const CONTENT_ELEMENTS = new Set(["Harmony", "Chord", "Rest", "Tuplet", "endTuplet", "location"]);

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

	write(
		voice: Voice,
		measureLength: Fraction,
		spannerWriter: SpannerWriter,
		enclosureWriter: EnclosureWriter,
	): void {
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
		element.appendChild(elementWithText(this.document, "root", String(harmony.root)));
		element.appendChild(elementWithText(this.document, "name", harmony.name));
		if (harmony.base !== undefined) {
			element.appendChild(elementWithText(this.document, "base", String(harmony.base)));
		}
		this.voiceElement.appendChild(element);
	}

	private removeContent(): void {
		childElements(this.voiceElement)
			.filter((element) => CONTENT_ELEMENTS.has(element.nodeName))
			.forEach((element) => {
				this.voiceElement.removeChild(element);
			});
	}
}
