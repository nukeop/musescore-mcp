import type { Voice, VoiceEvent } from "../../model/score";

export class MeasuresRenderer {
	constructor(private readonly voices: (Voice | undefined)[]) {}

	render(): string {
		return this.voices.map((voice) => this.renderBar(voice)).join(" | ");
	}

	private renderBar(voice: Voice | undefined): string {
		return (voice?.events ?? []).map((event) => this.renderEvent(event)).join(" ");
	}

	private renderEvent(event: VoiceEvent): string {
		const duration = `${event.duration.type}${".".repeat(event.duration.dots)}`;
		if (event.kind === "rest") {
			return `r:${duration}`;
		}
		return event.notes.map((note) => `${note.pitch}:${duration}`).join(" ");
	}
}
