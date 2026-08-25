import type { Document } from "@xmldom/xmldom";
import type { Chord, Measure, Voice } from "../model/score";
import { child } from "./score-dom";
import { VoiceWriter } from "./voice-writer";

export class MeasureWriter {
	constructor(
		private readonly document: Document,
		private readonly measure: Measure,
	) {}

	write(bar: Voice, previousChord: Chord | undefined): Chord | undefined {
		const voiceElement = child(this.measure.element, "voice");
		return new VoiceWriter(this.document, voiceElement!).write(bar, previousChord);
	}
}
