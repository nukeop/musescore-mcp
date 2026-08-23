import { parseDuration } from "../model/duration-tables";
import type { Duration, ScorePart, Voice, VoiceEvent } from "../model/score";
import { WrittenPitch } from "../model/written-pitch";
import type { WordToken } from "./token";
import { TokenCursor } from "./token-cursor";
import { tokenize } from "./tokenize";

export class NotationParser {
	private readonly cursor: TokenCursor;
	private carriedDuration: Duration | undefined;

	constructor(
		notation: string,
		private readonly part: ScorePart,
	) {
		this.cursor = new TokenCursor(tokenize(notation));
	}

	parse(): Voice[] {
		const bars = [this.parseBar()];
		while (this.cursor.match("pipe")) {
			bars.push(this.parseBar());
		}
		return bars;
	}

	private parseBar(): Voice {
		const events = [this.parseEvent()];
		while (this.cursor.peek().kind === "word") {
			events.push(this.parseEvent());
		}
		return { events };
	}

	private parseEvent(): VoiceEvent {
		const word = this.cursor.expectWord();

		if (word.text === "R") {
			return { kind: "rest", duration: { type: "measure", dots: 0 } };
		}

		const duration = this.eventDuration(word);

		if (word.text === "r") {
			return { kind: "rest", duration };
		}

		return {
			kind: "chord",
			duration,
			notes: [WrittenPitch.parse(word.text).toNote(this.part)],
		};
	}

	private eventDuration(word: WordToken): Duration {
		if (this.cursor.match("colon")) {
			const duration = parseDuration(this.cursor.expectWord().text);
			this.carriedDuration = duration;
			return duration;
		}

		if (!this.carriedDuration) {
			throw new Error(`Missing duration: ${word.text}`);
		}

		return this.carriedDuration;
	}
}
