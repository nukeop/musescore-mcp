import { validateBarFill } from "../model/bar-fill";
import type { Staff, TimeSig, Voice } from "../model/score";
import { MeasureWriter } from "./measure-writer";
import type { ScoreFile } from "./score-file";

export class StaffWriter {
	constructor(
		private readonly scoreFile: ScoreFile,
		private readonly staff: Staff,
	) {}

	write(from: number, bars: Voice[]): void {
		const to = from - 1 + bars.length;

		if (to > this.staff.measures.length) {
			throw new Error(
				`Measure range ${from}-${to} exceeds score length (${this.staff.measures.length} measures): ${this.scoreFile.path}`,
			);
		}

		bars.forEach((bar, index) => {
			validateBarFill(bar, index + 1, this.timeSigAt(from + index));
		});

		const targetMeasures = this.staff.measures.slice(from - 1, to);
		bars.forEach((bar, index) => {
			new MeasureWriter(this.scoreFile.document, targetMeasures[index]!).write(bar);
		});
	}

	private timeSigAt(measureNumber: number): TimeSig {
		const declared = this.staff.measures.slice(0, measureNumber).findLast((measure) => measure.timeSig);
		return declared?.timeSig ?? { beats: 4, beatUnit: 4 };
	}
}
