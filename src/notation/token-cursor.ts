import type { HarmonyToken, SuffixToken, Token, WordToken } from "./token";

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
			throw new Error(`Expected ${kind}, got ${token.kind} at offset ${token.offset}`);
		}
		this.index += 1;
	}

	matchHarmony(): HarmonyToken | undefined {
		const token = this.peek();
		if (token.kind !== "harmony") {
			return undefined;
		}
		this.index += 1;
		return token;
	}

	matchSuffix(): SuffixToken | undefined {
		const token = this.peek();
		if (token.kind !== "suffix") {
			return undefined;
		}
		this.index += 1;
		return token;
	}

	expectWord(): WordToken {
		const token = this.peek();
		if (token.kind !== "word") {
			throw new Error(`Expected a word, got ${token.kind} at offset ${token.offset}`);
		}
		this.index += 1;
		return token;
	}
}
