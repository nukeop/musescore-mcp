import type { Element } from "@xmldom/xmldom";
import type { Measure, Staff } from "../model/score";
import { requiredChild } from "./score-dom";

export function assertMeasureInRange(staves: Staff[], measure: number, path: string): void {
	const length = staves[0]?.measures.length ?? 0;
	if (measure > length) {
		throw new Error(`Measure ${measure} exceeds score length (${length} measures): ${path}`);
	}
}

export function firstStaff(staves: Staff[]): Staff {
	const staff = staves[0];
	if (!staff) {
		throw new Error("Score has no staves");
	}
	return staff;
}

export function measureAt(staff: Staff, measure: number): Measure {
	const found = staff.measures[measure - 1];
	if (!found) {
		throw new Error(`Measure ${measure} does not exist`);
	}
	return found;
}

export function voiceAt(staff: Staff, measure: number): Element {
	return requiredChild(measureAt(staff, measure).element, "voice");
}
