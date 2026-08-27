import type { Document, Element } from "@xmldom/xmldom";
import { elementWithText } from "../score-dom";

export function buildTempo(document: Document, bpm: number): Element {
	const quarterNotesPerSecond = Math.round((bpm / 60) * 1_000_000) / 1_000_000;
	const tempo = document.createElement("Tempo");
	tempo.appendChild(elementWithText(document, "tempo", String(quarterNotesPerSecond)));
	tempo.appendChild(elementWithText(document, "followText", "1"));
	const text = document.createElement("text");
	text.appendChild(elementWithText(document, "sym", "metNoteQuarterUp"));
	text.appendChild(document.createTextNode(` = ${bpm}`));
	tempo.appendChild(text);
	return tempo;
}
