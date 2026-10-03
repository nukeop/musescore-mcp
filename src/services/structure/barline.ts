import type { Document, Element } from "@xmldom/xmldom";
import type { BarlineType, EndBarlineType, Staff } from "../../model/score";
import { assertMeasureInRange, firstStaff, measureAt, voiceAt } from "../measure-range";
import { child, elementWithText, removeChildren, requiredChild, textIn } from "../score-dom";
import type { ScoreFile } from "../score-file";

export function readStartRepeat(measure: Element): boolean {
	return child(measure, "startRepeat") !== undefined;
}

export function readEndRepeat(measure: Element): number | undefined {
	const endRepeat = child(measure, "endRepeat");
	return endRepeat && Number(endRepeat.textContent);
}

const SUBTYPES: Record<EndBarlineType, string> = {
	double: "double",
	final: "end",
};

// "normal" is absent on purpose: a normal barline is no override, so readBarline reports none.
const TYPES_BY_SUBTYPE: Record<string, BarlineType> = {
	double: "double",
	end: "final",
	dashed: "dashed",
	dotted: "dotted",
	heavy: "heavy",
	"double-heavy": "double-heavy",
	"reverse-end": "reverse-end",
	"start-repeat": "start-repeat",
	"end-repeat": "end-repeat",
	"end-start-repeat": "end-start-repeat",
};

export function readBarline(voice: Element): BarlineType | undefined {
	const barLine = child(voice, "BarLine");
	return barLine && TYPES_BY_SUBTYPE[textIn(barLine, "subtype")];
}

function buildBarLine(document: Document, type: EndBarlineType): Element {
	const barLine = document.createElement("BarLine");
	barLine.appendChild(elementWithText(document, "subtype", SUBTYPES[type]));
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
			requiredChild(measureElement, "voice"),
		);
	}

	endRepeat(measure: number, count = 2): void {
		assertMeasureInRange(this.staves, measure, this.scoreFile.path);
		this.removeEndOverrides(measure);
		const measureElement = this.firstStaffMeasure(measure);
		measureElement.insertBefore(
			elementWithText(this.scoreFile.document, "endRepeat", String(count)),
			requiredChild(measureElement, "voice"),
		);
	}

	endBarline(measure: number, type: EndBarlineType): void {
		assertMeasureInRange(this.staves, measure, this.scoreFile.path);
		this.removeEndOverrides(measure);
		this.voices(measure).forEach((voice) => {
			voice.appendChild(buildBarLine(this.scoreFile.document, type));
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
		return this.staves.map((staff) => voiceAt(staff, measure));
	}

	private firstStaffMeasure(measure: number): Element {
		return measureAt(firstStaff(this.staves), measure).element;
	}
}
