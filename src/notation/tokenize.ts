import { suffixForChar } from "./suffixes";
import type { Token } from "./token";

type Scan = { token: Token; end: number };

const SINGLE_CHAR_KINDS = {
	":": "colon",
	"(": "lparen",
	")": "rparen",
	"|": "pipe",
} as const;

type SingleCharToken = keyof typeof SINGLE_CHAR_KINDS;

function isSingleCharToken(ch: string): ch is SingleCharToken {
	return ch in SINGLE_CHAR_KINDS;
}

function scanSingleChar(source: string, offset: number): Scan | undefined {
	const ch = source.charAt(offset);
	if (!isSingleCharToken(ch)) {
		return undefined;
	}
	return { token: { kind: SINGLE_CHAR_KINDS[ch], offset }, end: offset + 1 };
}

function scanSuffix(source: string, offset: number): Scan | undefined {
	const suffix = suffixForChar(source.charAt(offset));
	if (!suffix) {
		return undefined;
	}
	return { token: { kind: "suffix", suffix, offset }, end: offset + 1 };
}

function scanHarmony(source: string, offset: number): Scan | undefined {
	if (source.charAt(offset) !== "[") {
		return undefined;
	}
	const close = source.indexOf("]", offset + 1);
	if (close < 0) {
		throw new Error(`Unclosed chord symbol at offset ${offset}`);
	}
	return { token: { kind: "harmony", text: source.substring(offset + 1, close), offset }, end: close + 1 };
}

function isWordChar(ch: string): boolean {
	return ch !== " " && ch !== "[" && !isSingleCharToken(ch) && suffixForChar(ch) === undefined;
}

function scanWord(source: string, offset: number): Scan {
	let end = offset;
	while (end < source.length && isWordChar(source.charAt(end))) {
		end += 1;
	}
	return { token: { kind: "word", text: source.substring(offset, end), offset }, end };
}

function scanToken(source: string, offset: number): Scan {
	return (
		scanSingleChar(source, offset) ??
		scanSuffix(source, offset) ??
		scanHarmony(source, offset) ??
		scanWord(source, offset)
	);
}

export function tokenize(source: string): Token[] {
	const tokens: Token[] = [];
	let offset = 0;
	while (offset < source.length) {
		if (source.charAt(offset) === " ") {
			offset += 1;
			continue;
		}
		const scan = scanToken(source, offset);
		tokens.push(scan.token);
		offset = scan.end;
	}
	tokens.push({ kind: "eof", offset: source.length });
	return tokens;
}
