import { durationSymbol } from "../../model/durations";
import type { Duration, Note, ScorePart, Voice, VoiceEvent } from "../../model/score";
import { WrittenPitch } from "../../model/written-pitch";

export class MeasuresRenderer {
	private previousDuration: string | undefined;

	constructor(
		private readonly voices: (Voice | undefined)[],
		private readonly part: ScorePart,
	) {}

	render(): string {
		return this.voices.map((voice) => this.renderBar(voice)).join(" | ");
	}

	private renderBar(voice: Voice | undefined): string {
		return (voice?.events ?? []).map((event) => this.renderEvent(event)).join(" ");
	}

	private renderEvent(event: VoiceEvent): string {
		if (event.kind === "tuplet") {
			const members = event.events.map((member) => this.renderEvent(member)).join(" ");
			return `(${event.actualNotes}:${event.normalNotes} ${members})`;
		}
		if (event.kind === "rest") {
			return `r${this.renderDuration(event.duration)}`;
		}
		return event.notes
			.map((note) => `${this.renderNote(note)}${this.renderDuration(event.duration)}`)
			.join(" ");
	}

	private renderDuration(duration: Duration): string {
		const token = `${durationSymbol(duration.type)}${".".repeat(duration.dots)}`;
		if (token === this.previousDuration) {
			return "";
		}
		this.previousDuration = token;
		return `:${token}`;
	}

	private renderNote(note: Note): string {
		return WrittenPitch.fromNote(note, this.part).name;
	}
}
