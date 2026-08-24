export type WordToken = { kind: "word"; text: string; offset: number };

export type SuffixChar = "~";

export type SuffixToken = { kind: "suffix"; char: SuffixChar; offset: number };

export type Token =
	| WordToken
	| SuffixToken
	| { kind: "colon"; offset: number }
	| { kind: "lparen"; offset: number }
	| { kind: "rparen"; offset: number }
	| { kind: "pipe"; offset: number }
	| { kind: "eof"; offset: number };
