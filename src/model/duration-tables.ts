export type NoteDuration = "whole" | "half" | "quarter" | "eighth" | "16th" | "32nd" | "64th" | "128th";

export type MscxDurationType = "measure" | NoteDuration;

export type DurationSymbol = "1" | "2" | "4" | "8" | "16" | "32" | "64" | "128";
export type DottedDuration = DurationSymbol | `${DurationSymbol}.` | `${DurationSymbol}..`;

export const DURATIONS_MAP: Record<NoteDuration, number> = {
	whole: 1,
	half: 2,
	quarter: 4,
	eighth: 8,
	"16th": 16,
	"32nd": 32,
	"64th": 64,
	"128th": 128,
};

const TYPE_TO_SYMBOL: Record<NoteDuration, DurationSymbol> = {
	whole: "1",
	half: "2",
	quarter: "4",
	eighth: "8",
	"16th": "16",
	"32nd": "32",
	"64th": "64",
	"128th": "128",
};

const SYMBOL_TO_TYPE: Record<DurationSymbol, NoteDuration> = {
	"1": "whole",
	"2": "half",
	"4": "quarter",
	"8": "eighth",
	"16": "16th",
	"32": "32nd",
	"64": "64th",
	"128": "128th",
};

export function durationSymbol(type: NoteDuration, dots: number): DottedDuration {
	const base = TYPE_TO_SYMBOL[type];
	if (dots === 1) {
		return `${base}.`;
	}
	if (dots === 2) {
		return `${base}..`;
	}
	return base;
}

export function parseDuration(symbol: string): { type: NoteDuration; dots: number } {
	const base = symbol.replace(/\.+$/, "");
	const dots = symbol.length - base.length;
	if (!isDurationSymbol(base)) {
		throw new Error(`Invalid duration: ${symbol}`);
	}
	return { type: SYMBOL_TO_TYPE[base], dots };
}

function isDurationSymbol(value: string): value is DurationSymbol {
	return value in SYMBOL_TO_TYPE;
}
