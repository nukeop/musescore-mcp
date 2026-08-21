import { noteName } from "../../model/pitch";
import type { Note, Voice, VoiceEvent } from "../../model/score";

export class MeasuresRenderer {
	constructor(
		private readonly voices: (Voice | undefined)[],
		private readonly transposeChromatic: number,
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
		const duration = `${event.duration.type}${".".repeat(event.duration.dots)}`;
		if (event.kind === "rest") {
			return `r:${duration}`;
		}
		return event.notes.map((note) => `${this.renderNote(note)}:${duration}`).join(" ");
	}

	private renderNote(note: Note): string {
		return noteName(note.tpc2 ?? note.tpc, note.pitch - this.transposeChromatic);
	}
}
