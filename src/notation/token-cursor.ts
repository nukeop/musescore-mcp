import type { Token } from "./token";

export class TokenCursor {
	constructor(private readonly tokens: Token[]) {}

	peek(): Token {}

	advance(): Token {}

	match(kind: Token["kind"]): boolean {}

	expect(kind: Token["kind"]): Token {}
}
