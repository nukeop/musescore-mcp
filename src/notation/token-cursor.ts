import type { Token, WordToken } from "./token";

const TOKEN_NAMES: Record<Token["kind"], string> = {
	word: "a word",
	colon: '":"',
	lparen: '"("',
	rparen: '")"',
	pipe: '"|"',
	eof: "end of input",
};

export class TokenCursor {
	private index = 0;

	constructor(private readonly tokens: Token[]) {}

	peek(): Token {
		return this.tokens[this.index]!;
	}

	match(kind: Token["kind"]): boolean {
		if (this.peek().kind !== kind) {
			return false;
		}
		this.index += 1;
		return true;
	}

	expect(kind: Token["kind"]): void {
		const token = this.peek();
		if (token.kind !== kind) {
			throw new Error(
				`Expected ${TOKEN_NAMES[kind]}, got ${TOKEN_NAMES[token.kind]} at offset ${token.offset}`,
			);
		}
		this.index += 1;
	}

	expectWord(): WordToken {
		const token = this.peek();
		if (token.kind !== "word") {
			throw new Error(`Expected a word, got ${TOKEN_NAMES[token.kind]} at offset ${token.offset}`);
		}
		this.index += 1;
		return token;
	}
}
