import type { Document, Element } from "@xmldom/xmldom";
import type { TimeSig } from "../../model/score";
import { elementWithText } from "../score-dom";

export function buildTimeSig(document: Document, time: TimeSig): Element {
	const timeSig = document.createElement("TimeSig");
	timeSig.appendChild(elementWithText(document, "sigN", String(time.beats)));
	timeSig.appendChild(elementWithText(document, "sigD", String(time.beatUnit)));
	return timeSig;
}
