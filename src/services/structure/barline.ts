import type { Document, Element } from "@xmldom/xmldom";
import type { Staff } from "../../model/score";
import { assertMeasureInRange } from "../measure-range";
import { child, elementWithText, removeChildren, textIn } from "../score-dom";
import type { ScoreFile } from "../score-file";

export function readStartRepeat(measure: Element): boolean {
	return child(measure, "startRepeat") !== undefined;
}

export function readEndRepeat(measure: Element): number | undefined {
	const endRepeat = child(measure, "endRepeat");
	return endRepeat && Number(endRepeat.textContent);
}

export function readBarline(voice: Element): string | undefined {
	const barLine = child(voice, "BarLine");
	return barLine && textIn(barLine, "subtype");
}

export function buildDoubleBarLine(document: Document): Element {
	const barLine = document.createElement("BarLine");
	barLine.appendChild(elementWithText(document, "subtype", "double"));
	return barLine;
}

export class BarlineWriter {
	constructor(
		private readonly scoreFile: ScoreFile,
		private readonly staves: Staff[],
	) {}

	startRepeat(measure: number): void {
		assertMeasureInRange(this.staves, measure, this.scoreFile.path);
		const measureElement = this.firstStaffMeasure(measure);
		removeChildren(measureElement, "startRepeat");
		measureElement.insertBefore(
			this.scoreFile.document.createElement("startRepeat"),
			child(measureElement, "voice")!,
		);
	}

	endRepeat(measure: number, count = 2): void {
		assertMeasureInRange(this.staves, measure, this.scoreFile.path);
		this.removeEndOverrides(measure);
		const measureElement = this.firstStaffMeasure(measure);
		measureElement.insertBefore(
			elementWithText(this.scoreFile.document, "endRepeat", String(count)),
			child(measureElement, "voice")!,
		);
	}

	double(measure: number): void {
		assertMeasureInRange(this.staves, measure, this.scoreFile.path);
		this.removeEndOverrides(measure);
		this.voices(measure).forEach((voice) => {
			voice.appendChild(buildDoubleBarLine(this.scoreFile.document));
		});
	}

	clear(measure: number): void {
		assertMeasureInRange(this.staves, measure, this.scoreFile.path);
		removeChildren(this.firstStaffMeasure(measure), "startRepeat");
		this.removeEndOverrides(measure);
	}

	private removeEndOverrides(measure: number): void {
		removeChildren(this.firstStaffMeasure(measure), "endRepeat");
		this.voices(measure).forEach((voice) => {
			removeChildren(voice, "BarLine");
		});
	}

	private voices(measure: number): Element[] {
		return this.staves.map((staff) => child(staff.measures[measure - 1]!.element, "voice")!);
	}

	private firstStaffMeasure(measure: number): Element {
		return this.staves[0]!.measures[measure - 1]!.element;
	}
}
