export type WordToken = { kind: "word"; text: string; offset: number };

export type Token =
	| WordToken
	| { kind: "colon"; offset: number }
	| { kind: "lparen"; offset: number }
	| { kind: "rparen"; offset: number }
	| { kind: "pipe"; offset: number }
	| { kind: "eof"; offset: number };
