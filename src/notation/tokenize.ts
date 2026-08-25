import type { Token } from "./token";

export function tokenize(source: string): Token[] {
	const tokens: Token[] = [];
	let wordStart = -1;

	const closeWord = (end: number): void => {
		if (wordStart >= 0) {
			tokens.push({ kind: "word", text: source.substring(wordStart, end), offset: wordStart });
			wordStart = -1;
		}
	};

	for (let offset = 0; offset < source.length; offset++) {
		switch (source.charAt(offset)) {
			case ":":
				closeWord(offset);
				tokens.push({ kind: "colon", offset });
				break;
			case "(":
				closeWord(offset);
				tokens.push({ kind: "lparen", offset });
				break;
			case ")":
				closeWord(offset);
				tokens.push({ kind: "rparen", offset });
				break;
			case "|":
				closeWord(offset);
				tokens.push({ kind: "pipe", offset });
				break;
			case "~":
				closeWord(offset);
				tokens.push({ kind: "suffix", char: "~", offset });
				break;
			case "[": {
				closeWord(offset);
				const close = source.indexOf("]", offset + 1);
				if (close < 0) {
					throw new Error(`Unclosed chord symbol at offset ${offset}`);
				}
				tokens.push({ kind: "harmony", text: source.substring(offset + 1, close), offset });
				offset = close;
				break;
			}
			case " ":
				closeWord(offset);
				break;
			default:
				if (wordStart < 0) {
					wordStart = offset;
				}
		}
	}

	closeWord(source.length);
	tokens.push({ kind: "eof", offset: source.length });
	return tokens;
}
