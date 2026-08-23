import type { ScorePart, Voice, VoiceEvent } from "../model/score";

export class NotationParser {
	constructor(
		private readonly notation: string,
		private readonly part: ScorePart,
	) {}

	parse(): Voice[] {}

	private parseBar(): Voice {}

	private parseEvent(): VoiceEvent {}
}
