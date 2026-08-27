import type { Document, Element } from "@xmldom/xmldom";
import { actualKey } from "../../model/keys";
import type { Transposition } from "../instruments";
import { elementWithText } from "../score-dom";

export function buildKeySig(
	document: Document,
	concertKey: number,
	transposition: Transposition | undefined,
): Element {
	const keySig = document.createElement("KeySig");
	keySig.appendChild(elementWithText(document, "concertKey", String(concertKey)));
	const actual = actualKey(concertKey, transposition);
	if (actual !== concertKey) {
		keySig.appendChild(elementWithText(document, "actualKey", String(actual)));
	}
	return keySig;
}
