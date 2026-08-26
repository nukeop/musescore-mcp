import { parseDuration } from "../model/duration-tables";
import {
	ACCIDENTAL_SEMITONES,
	type Accidental,
	isAccidental,
	isLetter,
	NATURAL_TPC,
} from "../model/pitch-tables";
import type { Chord, Duration, Harmony, ScorePart, Voice, VoiceEvent } from "../model/score";
import { WrittenPitch } from "../model/written-pitch";
import { EnclosureMarker } from "./enclosures";
import { suffixForParenName } from "./suffixes";
import type { WordToken } from "./token";
import { TokenCursor } from "./token-cursor";
import { tokenize } from "./tokenize";

export class NotationParser {
	private readonly cursor: TokenCursor;
	private readonly enclosures: EnclosureMarker;
	private carriedDuration: Duration | undefined;

	constructor(
		notation: string,
		private readonly part: ScorePart,
	) {
		this.cursor = new TokenCursor(tokenize(notation));
		this.enclosures = new EnclosureMarker(this.cursor);
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
		const events = [this.parseBarEvent()];
		while (this.continuesBar()) {
			events.push(this.parseBarEvent());
		}
		return { events };
	}

	private continuesBar(): boolean {
		const kind = this.cursor.peek().kind;
		return kind === "word" || kind === "harmony";
	}

	private parseBarEvent(): VoiceEvent {
		return this.enclosures.around(() => this.parseEvent());
	}

	private parseEvent(): VoiceEvent {
		const harmony = this.parseHarmony();
		const word = this.cursor.expectWord();
		const event = this.parseSuffixes(this.parseBody(word));
		if (harmony && (event.kind === "chord" || event.kind === "rest")) {
			return { ...event, harmony };
		}
		return event;
	}

	private parseHarmony(): Harmony | undefined {
		const token = this.cursor.matchHarmony();
		if (!token) {
			return undefined;
		}
		const letter = token.text.charAt(0);
		if (!isLetter(letter)) {
			throw new Error(`Invalid chord symbol root: ${token.text}`);
		}
		const secondChar = token.text.charAt(1);
		const accidental: Accidental = isAccidental(secondChar) ? secondChar : "";
		const name = token.text.substring(1 + accidental.length);
		return {
			root: NATURAL_TPC[letter] + 7 * ACCIDENTAL_SEMITONES[accidental],
			name,
		};
	}

	private parseSuffixes(event: VoiceEvent): VoiceEvent {
		if (event.kind !== "chord") {
			return event;
		}
		const token = this.cursor.matchSuffix();
		if (token) {
			return token.suffix.apply(event);
		}
		if (!this.cursor.match("lparen")) {
			return event;
		}
		const word = this.cursor.expectWord();
		this.cursor.expect("rparen");
		const suffix = suffixForParenName(word.text);
		if (!suffix) {
			throw new Error(`Unknown annotation: ${word.text}`);
		}
		return suffix.apply(event);
	}

	private parseBody(word: WordToken): VoiceEvent {
		if (word.text === "R") {
			return this.parseMeasureRest();
		}
		if (word.text === "chord" && this.cursor.match("lparen")) {
			return this.parseChord(word);
		}
		if (word.text === "tuplet" && this.cursor.match("lparen")) {
			return this.parseTuplet();
		}
		if (word.text === "grace" && this.cursor.match("lparen")) {
			return this.parseGrace();
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

	private parseNote(word: WordToken): Chord {
		return {
			kind: "chord",
			duration: this.eventDuration(word),
			notes: [WrittenPitch.parse(word.text).toNote(this.part)],
		};
	}

	private parseGrace(): VoiceEvent {
		const chord = this.parseNote(this.cursor.expectWord());
		this.cursor.expect("rparen");
		return { ...chord, grace: true };
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
