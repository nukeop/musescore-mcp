import type { Document, Element } from "@xmldom/xmldom";
import type { Rest } from "../../model/score";
import { appendDuration } from "./duration";

export class RestWriter {
	constructor(private readonly document: Document) {}

	write(rest: Rest): Element {
		const element = this.document.createElement("Rest");
		appendDuration(this.document, element, rest.duration);
		return element;
	}
}
