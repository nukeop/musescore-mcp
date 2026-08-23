import type { Document, Element } from "@xmldom/xmldom";
import type { Voice } from "../model/score";

export class VoiceWriter {
	constructor(
		private readonly document: Document,
		private readonly voiceElement: Element,
	) {}

	write(voice: Voice): void {
	}
}
