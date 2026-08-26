import type { Document } from "@xmldom/xmldom";
import type Fraction from "fraction.js";
import type { Measure, Voice } from "../model/score";
import type { EnclosureWriter } from "./elements/enclosure-writer";
import type { SpannerWriter } from "./elements/spanner-writer";
import { child } from "./score-dom";
import { VoiceWriter } from "./voice-writer";

export class MeasureWriter {
	constructor(
		private readonly document: Document,
		private readonly measure: Measure,
	) {}

	write(bar: Voice, measureLength: Fraction, spannerWriter: SpannerWriter, enclosureWriter: EnclosureWriter): void {
		const voiceElement = child(this.measure.element, "voice");
		new VoiceWriter(this.document, voiceElement!).write(bar, measureLength, spannerWriter, enclosureWriter);
	}
}
