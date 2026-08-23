import type { Token } from "./token";

export class TokenCursor {
	constructor(private readonly tokens: Token[]) {}
}
