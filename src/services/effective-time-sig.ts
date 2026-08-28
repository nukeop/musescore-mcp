import type { Measure, TimeSig } from "../model/score";

export function effectiveTimeSigAt(measures: Measure[], measureNumber: number): TimeSig {
	const declared = measures.slice(0, measureNumber).findLast((measure) => measure.timeSig);
	return declared?.timeSig ?? { beats: 4, beatUnit: 4 };
}
