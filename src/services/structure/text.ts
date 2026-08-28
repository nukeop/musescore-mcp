import type { Document, Element } from "@xmldom/xmldom";
import type { Staff } from "../../model/score";
import { assertMeasureInRange } from "../measure-range";
import { child, elementWithText, firstSpannerOrEvent, removeChildren } from "../score-dom";
import type { ScoreFile } from "../score-file";

export type TextStyle = "staff" | "system";

const ELEMENT_NAMES: Record<TextStyle, string> = {
	staff: "StaffText",
	system: "SystemText",
};

export function buildText(document: Document, style: TextStyle, text: string): Element {
	const element = document.createElement(ELEMENT_NAMES[style]);
	element.appendChild(elementWithText(document, "text", text));
	return element;
}

export class TextWriter {
	constructor(
		private readonly scoreFile: ScoreFile,
		private readonly staves: Staff[],
	) {}

	set(measure: number, style: TextStyle, text: string): void {
		assertMeasureInRange(this.staves, measure, this.scoreFile.path);
		const voice = child(this.staves[0]!.measures[measure - 1]!.element, "voice")!;
		removeChildren(voice, ELEMENT_NAMES[style]);
		voice.insertBefore(
			buildText(this.scoreFile.document, style, text),
			firstSpannerOrEvent(voice) ?? null,
		);
	}
}
