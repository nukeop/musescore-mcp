import type { Measure, Staff, TimeSig } from "../../model/score";
import { assertMeasureInRange, firstStaff, measureAt, voiceAt } from "../measure-range";
import { child, children, replaceOrPrepend } from "../score-dom";
import type { ScoreFile } from "../score-file";
import { buildTimeSig } from "./time-signature-element";

export class TimeSignatureWriter {
	constructor(
		private readonly scoreFile: ScoreFile,
		private readonly staves: Staff[],
	) {}

	set(measure: number, time: TimeSig): void {
		assertMeasureInRange(this.staves, measure, this.scoreFile.path);
		const affected = this.affectedMeasures(measure);
		this.assertEmpty(affected, measure);

		this.staves.forEach((staff) => {
			affected.forEach((measureNumber) => {
				this.rescaleMeasureRests(measureAt(staff, measureNumber), time);
			});
			const voice = voiceAt(staff, measure);
			replaceOrPrepend(voice, buildTimeSig(this.scoreFile.document, time));
		});
	}

	private affectedMeasures(measure: number): number[] {
		const last = this.lastAffectedMeasure(measure);
		return Array.from({ length: last - measure + 1 }, (_, offset) => measure + offset);
	}

	private lastAffectedMeasure(measure: number): number {
		const { measures } = firstStaff(this.staves);
		const next = measures.findIndex(
			(candidate, index) => index >= measure && candidate.timeSig !== undefined,
		);
		if (next === -1) {
			return measures.length;
		}
		return next;
	}

	private assertEmpty(affected: number[], measure: number): void {
		const offenders = affected.filter((measureNumber) => !this.isEmpty(measureNumber));
		if (offenders.length > 0) {
			throw new Error(
				`Measures ${offenders.join(", ")} must be empty (only measure rests) to change the time signature at measure ${measure}: ${this.scoreFile.path}`,
			);
		}
	}

	private isEmpty(measureNumber: number): boolean {
		return this.staves.every((staff) =>
			measureAt(staff, measureNumber).voices.every((voice) =>
				voice.events.every((event) => event.kind === "rest" && event.duration.type === "measure"),
			),
		);
	}

	private rescaleMeasureRests(measure: Measure, time: TimeSig): void {
		children(measure.element, "voice").forEach((voice) => {
			children(voice, "Rest").forEach((rest) => {
				const duration = child(rest, "duration");
				if (duration) {
					duration.textContent = `${time.beats}/${time.beatUnit}`;
				}
			});
		});
	}
}
