import Fraction from "fraction.js";
import { validateBarFill } from "../model/bar-fill";
import type { Staff, TimeSig, Voice } from "../model/score";
import { TieWriter } from "./elements/tie-writer";
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

		const tieWriter = new TieWriter(this.scoreFile.document);
		const targetMeasures = this.staff.measures.slice(from - 1, to);
		bars.forEach((bar, index) => {
			tieWriter.startBar();
			new MeasureWriter(this.scoreFile.document, targetMeasures[index]!).write(
				bar,
				this.measureLengthAt(from + index),
				tieWriter,
			);
		});
		tieWriter.startTie();
	}

	private timeSigAt(measureNumber: number): TimeSig {
		const declared = this.staff.measures.slice(0, measureNumber).findLast((measure) => measure.timeSig);
		return declared?.timeSig ?? { beats: 4, beatUnit: 4 };
	}

	private measureLengthAt(measureNumber: number): Fraction {
		const timeSig = this.timeSigAt(measureNumber);
		return new Fraction(timeSig.beats, timeSig.beatUnit);
	}
}
