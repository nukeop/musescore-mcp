import type { Staff } from "../../model/score";

export function assertMeasureInRange(staves: Staff[], measure: number, path: string): void {
	const length = staves[0]?.measures.length ?? 0;
	if (measure > length) {
		throw new Error(`Measure ${measure} exceeds score length (${length} measures): ${path}`);
	}
}
