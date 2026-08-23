export type Token =
	| { kind: "word"; text: string; offset: number }
	| { kind: "colon"; offset: number }
	| { kind: "lparen"; offset: number }
	| { kind: "rparen"; offset: number }
	| { kind: "pipe"; offset: number }
	| { kind: "eof"; offset: number };
