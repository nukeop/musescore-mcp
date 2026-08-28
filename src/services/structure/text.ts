import type { Document, Element } from "@xmldom/xmldom";
import type { Staff } from "../../model/score";
import { assertMeasureInRange } from "../measure-range";
import { child, elementWithText, firstSpannerOrEvent, removeChildren } from "../score-dom";
import type { ScoreFile } from "../score-file";

export type TextStyle = "staff" | "system";

export type SwingMode = "eighth" | "off";

const ELEMENT_NAMES: Record<TextStyle, string> = {
	staff: "StaffText",
	system: "SystemText",
};

const SWING_UNITS: Record<SwingMode, string> = {
	eighth: "eighth",
	off: "",
};

export function buildText(
	document: Document,
	style: TextStyle,
	text: string,
	swing?: SwingMode,
): Element {
	const element = document.createElement(ELEMENT_NAMES[style]);
	if (swing) {
		const swingElement = document.createElement("swing");
		swingElement.setAttribute("unit", SWING_UNITS[swing]);
		swingElement.setAttribute("ratio", "60");
		element.appendChild(swingElement);
		element.appendChild(elementWithText(document, "style", "tempo"));
	}
	element.appendChild(elementWithText(document, "text", text));
	return element;
}

export class TextWriter {
	constructor(
		private readonly scoreFile: ScoreFile,
		private readonly staves: Staff[],
	) {}

	set(measure: number, style: TextStyle, text: string, swing?: SwingMode): void {
		assertMeasureInRange(this.staves, measure, this.scoreFile.path);
		const voice = child(this.staves[0]!.measures[measure - 1]!.element, "voice")!;
		removeChildren(voice, ELEMENT_NAMES[style]);
		voice.insertBefore(
			buildText(this.scoreFile.document, style, text, swing),
			firstSpannerOrEvent(voice) ?? null,
		);
	}
}
