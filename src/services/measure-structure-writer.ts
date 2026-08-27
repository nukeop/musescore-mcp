import type { Element } from "@xmldom/xmldom";
import type { Measure, Staff } from "../model/score";
import type { ScoreFile } from "./score-file";
import { child } from "./score-dom";

function hasTiedLastEvent(measure: Measure | undefined): boolean {
	const lastEvent = measure?.voices[0]?.events.at(-1);
	return lastEvent?.kind === "chord" && lastEvent.notes.some((note) => note.tied);
}

function deleteFromStaff(staff: Staff, from: number, to: number): void {
	staff.measures.slice(from - 1, to).forEach((measure) => {
		measure.element.parentNode!.removeChild(measure.element);
	});
}

function moveSignatures(oldFirstMeasure: Measure, newFirstMeasureElement: Element): void {
	const oldVoice = child(oldFirstMeasure.element, "voice")!;
	const newVoice = child(newFirstMeasureElement, "voice")!;
	const rest = child(newVoice, "Rest")!;
	const keySig = child(oldVoice, "KeySig");
	const timeSig = child(oldVoice, "TimeSig");
	if (keySig) {
		newVoice.insertBefore(keySig, rest);
	}
	if (timeSig) {
		newVoice.insertBefore(timeSig, rest);
	}
}

export class MeasureStructureWriter {
	constructor(
		private readonly scoreFile: ScoreFile,
		private readonly staves: Staff[],
	) {}

	insert(at: number, count: number): void {
		const length = this.length();
		if (at > length + 1) {
			throw new Error(
				`Insert position ${at} exceeds score length (${length} measures): ${this.scoreFile.path}`,
			);
		}

		this.staves.forEach((staff) => {
			this.insertIntoStaff(staff, at, count);
		});
	}

	delete(from: number, to: number): void {
		const length = this.length();
		if (to > length) {
			throw new Error(
				`Measure range ${from}-${to} exceeds score length (${length} measures): ${this.scoreFile.path}`,
			);
		}
		if (length - (to - from + 1) === 0) {
			throw new Error(`Deleting measures ${from}-${to} would leave the score empty`);
		}
		this.assertNoBrokenTie(from, to, length);

		this.staves.forEach((staff) => {
			deleteFromStaff(staff, from, to);
		});
	}

	private length(): number {
		return this.staves[0]?.measures.length ?? 0;
	}

	private assertNoBrokenTie(from: number, to: number, length: number): void {
		const breaksBefore = this.staves.some((staff) => hasTiedLastEvent(staff.measures[from - 2]));
		if (breaksBefore) {
			throw new Error(`Deleting measures ${from}-${to} would break a tie between measures ${from - 1} and ${from}`);
		}
		const breaksAfter = to < length && this.staves.some((staff) => hasTiedLastEvent(staff.measures[to - 1]));
		if (breaksAfter) {
			throw new Error(`Deleting measures ${from}-${to} would break a tie between measures ${to} and ${to + 1}`);
		}
	}

	private insertIntoStaff(staff: Staff, at: number, count: number): void {
		const referenceMeasure = staff.measures[at - 1];
		const parent = staff.measures[0]!.element.parentNode!;

		const newMeasures = Array.from({ length: count }, () => this.buildEmptyMeasure());
		newMeasures.forEach((measureElement) => {
			if (referenceMeasure) {
				parent.insertBefore(measureElement, referenceMeasure.element);
			} else {
				parent.appendChild(measureElement);
			}
		});

		if (at === 1) {
			moveSignatures(staff.measures[0]!, newMeasures[0]!);
		}
	}

	private buildEmptyMeasure(): Element {
		const document = this.scoreFile.document;
		const measureElement = document.createElement("Measure");
		const voiceElement = document.createElement("voice");
		const restElement = document.createElement("Rest");
		const durationType = document.createElement("durationType");
		durationType.textContent = "measure";
		restElement.appendChild(durationType);
		voiceElement.appendChild(restElement);
		measureElement.appendChild(voiceElement);
		return measureElement;
	}
}
