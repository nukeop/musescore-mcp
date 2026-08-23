import type { Document } from "@xmldom/xmldom";
import type { Measure, Voice } from "../model/score";
import { child } from "./score-dom";
import { VoiceWriter } from "./voice-writer";

export class MeasureWriter {
	constructor(
		private readonly document: Document,
		private readonly measure: Measure,
	) {}

	write(bar: Voice): void {
		const voiceElement = child(this.measure.element, "voice");
		new VoiceWriter(this.document, voiceElement!).write(bar);
	}
}
