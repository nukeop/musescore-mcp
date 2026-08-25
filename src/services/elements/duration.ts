import type { Document, Element } from "@xmldom/xmldom";
import type { Duration } from "../../model/score";
import { elementWithText } from "../score-dom";

export function appendDuration(document: Document, parent: Element, duration: Duration): void {
	if (duration.dots > 0) {
		parent.appendChild(elementWithText(document, "dots", String(duration.dots)));
	}
	parent.appendChild(elementWithText(document, "durationType", duration.type));
}
