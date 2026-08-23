import type { ScorePart, Voice, VoiceEvent } from "../model/score";
import { TokenCursor } from "./token-cursor";

export class NotationParser {
	constructor(
		private readonly notation: string,
		private readonly part: ScorePart,
	) {}

	parse(): Voice[] {}

	private parseBar(): Voice {}

	private parseEvent(): VoiceEvent {}
}
