import Fraction from "fraction.js";
import { durationFraction } from "./duration-tables";
import type { TimeSig, Voice, VoiceEvent } from "./score";
import { tupletDuration } from "./tuplets";

export function validateBarFill(bar: Voice, barNumber: number, timeSig: TimeSig): void {
	const barMeasureLength = new Fraction(timeSig.beats, timeSig.beatUnit);

	const barLength = bar.events.reduce((currentPos, event) => {
		const nextPos = currentPos.add(eventDuration(event, barMeasureLength));
		if (nextPos.compare(barMeasureLength) > 0) {
			throw new Error(`Bar ${barNumber} overflows at beat ${beatAt(currentPos, timeSig)}`);
		}
		return nextPos;
	}, new Fraction(0));

	if (barLength.compare(barMeasureLength) < 0) {
		const missing = barMeasureLength.sub(barLength);
		throw new Error(`Bar ${barNumber} is short by ${missing.toFraction()} of a whole note`);
	}
}

export function eventDuration(event: VoiceEvent, measureLength: Fraction): Fraction {
	if (event.kind === "chord" && event.grace) {
		return new Fraction(0);
	}
	if (event.kind === "tuplet") {
		return tupletDuration(event);
	}
	if (event.duration.type === "measure") {
		return measureLength;
	}
	return durationFraction(event.duration.type, event.duration.dots);
}

function beatAt(position: Fraction, timeSig: TimeSig): number {
	return Math.floor(position.mul(timeSig.beatUnit).valueOf()) + 1;
}
