import type { Document, Element } from "@xmldom/xmldom";
import type { Staff } from "../../model/score";
import { assertMeasureInRange } from "../measure-range";
import { child, elementWithText, replaceOrPrepend, textIn } from "../score-dom";
import type { ScoreFile } from "../score-file";

export function readRehearsalMark(voice: Element): string | undefined {
	const mark = child(voice, "RehearsalMark");
	return mark && textIn(mark, "text");
}

export function buildRehearsalMark(document: Document, text: string): Element {
	const rehearsalMark = document.createElement("RehearsalMark");
	rehearsalMark.appendChild(elementWithText(document, "text", text));
	return rehearsalMark;
}

export class RehearsalMarkWriter {
	constructor(
		private readonly scoreFile: ScoreFile,
		private readonly staves: Staff[],
	) {}

	set(measure: number, text: string): void {
		assertMeasureInRange(this.staves, measure, this.scoreFile.path);

		const voice = child(this.staves[0]!.measures[measure - 1]!.element, "voice")!;
		replaceOrPrepend(voice, buildRehearsalMark(this.scoreFile.document, text));
	}
}
