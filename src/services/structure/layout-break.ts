import type { Document, Element } from "@xmldom/xmldom";
import type { Staff } from "../../model/score";
import { assertMeasureInRange } from "../measure-range";
import { child, elementWithText, removeChildren } from "../score-dom";
import type { ScoreFile } from "../score-file";

export type LayoutBreakType = "system" | "page" | "section";

const SUBTYPES: Record<LayoutBreakType, string> = {
	system: "line",
	page: "page",
	section: "section",
};

export function buildLayoutBreak(document: Document, type: LayoutBreakType): Element {
	const layoutBreak = document.createElement("LayoutBreak");
	layoutBreak.appendChild(elementWithText(document, "subtype", SUBTYPES[type]));
	return layoutBreak;
}

export class LayoutBreakWriter {
	constructor(
		private readonly scoreFile: ScoreFile,
		private readonly staves: Staff[],
	) {}

	set(measure: number, type: LayoutBreakType): void {
		assertMeasureInRange(this.staves, measure, this.scoreFile.path);
		const measureElement = this.measureElement(measure);
		removeChildren(measureElement, "LayoutBreak");
		measureElement.insertBefore(
			buildLayoutBreak(this.scoreFile.document, type),
			child(measureElement, "voice")!,
		);
	}

	clear(measure: number): void {
		assertMeasureInRange(this.staves, measure, this.scoreFile.path);
		removeChildren(this.measureElement(measure), "LayoutBreak");
	}

	private measureElement(measure: number): Element {
		return this.staves[0]!.measures[measure - 1]!.element;
	}
}
