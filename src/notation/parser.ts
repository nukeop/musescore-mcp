import type { ScorePart, Voice, VoiceEvent } from "../model/score";
import { tokenize } from "./tokenize";

export class NotationParser {
	constructor(
		private readonly notation: string,
		private readonly part: ScorePart,
	) {}

	parse(): Voice[] {
		const tokens = tokenize(this.notation);
		console.log({ tokens });
		return [];
	}

	private parseBar(): Voice {}

	private parseEvent(): VoiceEvent {}
}
