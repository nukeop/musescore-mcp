import Fraction from "fraction.js";
import { durationFraction, type NoteDuration, undottedDurationOf } from "./duration-tables";
import type { Tuplet } from "./score";

// One "normal" unit of the tuplet, which MuseScore stores as <baseNote>.
// A complete tuplet's notes fill exactly actualNotes of these units.
export function tupletBaseNote(tuplet: Tuplet): NoteDuration {
	const content = contentDuration(tuplet);
	const baseNote = undottedDurationOf(content.div(tuplet.actualNotes));
	if (!baseNote) {
		throw new Error(
			`Tuplet ${tuplet.actualNotes}:${tuplet.normalNotes} is incomplete: its notes add up to ${content.toFraction()} of a whole note, which is not ${tuplet.actualNotes} equal undotted notes`,
		);
	}
	return baseNote;
}

// The time the tuplet takes in the bar: normalNotes base notes
export function tupletDuration(tuplet: Tuplet): Fraction {
	return durationFraction(tupletBaseNote(tuplet), 0).mul(tuplet.normalNotes);
}

function contentDuration(tuplet: Tuplet): Fraction {
	return tuplet.events
		.map((member) => {
			if (member.kind === "tuplet" || member.duration.type === "measure") {
				throw new Error("Tuplet members must be notes or rests with explicit durations");
			}
			return durationFraction(member.duration.type, member.duration.dots);
		})
		.reduce((sum, duration) => sum.add(duration), new Fraction(0));
}
