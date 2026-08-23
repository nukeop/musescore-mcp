import type { Document, Element } from "@xmldom/xmldom";
import type { Voice } from "../model/score";
import { children, elementWithText } from "./score-dom";

export class VoiceWriter {
	constructor(
		private readonly document: Document,
		private readonly voiceElement: Element,
	) {}

	write(voice: Voice): void {
		this.removeContent();

		const rest = this.document.createElement("Rest");
		rest.appendChild(elementWithText(this.document, "durationType", "measure"));
		this.voiceElement.appendChild(rest);
	}

	private removeContent(): void {
		const content = [...children(this.voiceElement, "Chord"), ...children(this.voiceElement, "Rest")];
		content.forEach((element) => {
			this.voiceElement.removeChild(element);
		});
	}
}
