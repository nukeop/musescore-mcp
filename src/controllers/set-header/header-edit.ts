import type { Document, Element } from "@xmldom/xmldom";
import { child, children, elementWithText, textElementIn, textIn } from "../../services/score-dom";
import type { ScoreFile } from "../../services/score-file";

const headerStyles = ["title", "subtitle", "composer", "lyricist"] as const;

export type HeaderFields = Partial<Record<(typeof headerStyles)[number], string>>;

export function editHeader(scoreFile: ScoreFile, fields: HeaderFields): void {
	headerStyles.forEach((style) => {
		const value = fields[style];
		if (value !== undefined) {
			setHeaderText(scoreFile.document, headerFrameIn(scoreFile), style, value);
		}
	});
}

function headerFrameIn(scoreFile: ScoreFile): Element {
	const existing = child(scoreFile.firstStaff, "VBox");
	if (existing !== undefined) {
		return existing;
	}
	return createFrame(scoreFile.document, scoreFile.firstStaff);
}

function createFrame(document: Document, staff: Element): Element {
	const frame = document.createElement("VBox");
	frame.appendChild(elementWithText(document, "height", "10"));
	staff.insertBefore(frame, child(staff, "Measure") ?? null);
	return frame;
}

function setHeaderText(document: Document, frame: Element, style: string, value: string): void {
	const existing = children(frame, "Text").find((text) => textIn(text, "style") === style);
	if (!existing) {
		frame.appendChild(renderHeaderText(document, style, value));
		return;
	}
	textElementIn(document, existing).textContent = value;
}

function renderHeaderText(document: Document, style: string, value: string): Element {
	const text = document.createElement("Text");
	text.appendChild(elementWithText(document, "style", style));
	text.appendChild(elementWithText(document, "text", value));
	return text;
}
