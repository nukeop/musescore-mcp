import Fraction from "fraction.js";
import { durationFraction } from "./duration-tables";
import type { TimeSig, Tuplet, Voice, VoiceEvent } from "./score";

export function validateBarFill(bar: Voice, barNumber: number, timeSig: TimeSig): void {
	const measureLength = new Fraction(timeSig.beats, timeSig.beatUnit);

	const barLength = bar.events.reduce((currentPos, event) => {
		const nextPos = currentPos.add(eventDuration(event, measureLength));
		if (nextPos.compare(measureLength) > 0) {
			throw new Error(`Bar ${barNumber} overflows at beat ${beatAt(currentPos, timeSig)}`);
		}
		return nextPos;
	}, new Fraction(0));

	if (barLength.compare(measureLength) < 0) {
		const missing = measureLength.sub(barLength);
		throw new Error(`Bar ${barNumber} is short by ${missing.toFraction()} of a whole note`);
	}
}

export function eventDuration(event: VoiceEvent, measureLength: Fraction): Fraction {
	if (event.kind === "tuplet") {
		return elementsDuration(event);
	}
	if (event.duration.type === "measure") {
		return measureLength;
	}
	return durationFraction(event.duration.type, event.duration.dots);
}

function elementsDuration(tuplet: Tuplet): Fraction {
	return tuplet.events
		.map((member) => {
			if (member.kind === "tuplet" || member.duration.type === "measure") {
				throw new Error("Tuplet members must be notes or rests with explicit durations");
			}
			return durationFraction(member.duration.type, member.duration.dots);
		})
		.reduce((sum, duration) => sum.add(duration), new Fraction(0))
		.mul(tuplet.normalNotes, tuplet.actualNotes);
}

function beatAt(position: Fraction, timeSig: TimeSig): number {
	return Math.floor(position.mul(timeSig.beatUnit).valueOf()) + 1;
}
