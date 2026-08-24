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
		this.cursor.expect("eof");
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
			return this.parseMeasureRest();
		}
		if (word.text === "chord" && this.cursor.match("lparen")) {
			return this.parseChord(word);
		}
		if (word.text === "tuplet" && this.cursor.match("lparen")) {
			return this.parseTuplet();
		}
		if (word.text === "r") {
			return this.parseRest(word);
		}
		return this.parseNote(word);
	}

	private parseMeasureRest(): VoiceEvent {
		return { kind: "rest", duration: { type: "measure", dots: 0 } };
	}

	private parseRest(word: WordToken): VoiceEvent {
		return { kind: "rest", duration: this.eventDuration(word) };
	}

	private parseNote(word: WordToken): VoiceEvent {
		return {
			kind: "chord",
			duration: this.eventDuration(word),
			notes: [WrittenPitch.parse(word.text).toNote(this.part)],
		};
	}

	private parseTuplet(): VoiceEvent {
		const actualNotes = Number(this.cursor.expectWord().text);
		this.cursor.expect("colon");
		const normalNotes = Number(this.cursor.expectWord().text);

		const events = [this.parseEvent()];
		while (this.cursor.peek().kind === "word") {
			events.push(this.parseEvent());
		}
		this.cursor.expect("rparen");

		return { kind: "tuplet", actualNotes, normalNotes, events };
	}

	private parseChord(word: WordToken): VoiceEvent {
		const notes = [this.cursor.expectWord()];
		while (this.cursor.peek().kind === "word") {
			notes.push(this.cursor.expectWord());
		}
		this.cursor.expect("rparen");

		return {
			kind: "chord",
			duration: this.eventDuration(word),
			notes: notes.map((note) => WrittenPitch.parse(note.text).toNote(this.part)),
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
