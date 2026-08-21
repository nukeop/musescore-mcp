const DURATION_SYMBOLS: Record<string, string> = {
	whole: "1",
	half: "2",
	quarter: "4",
	eighth: "8",
	"16th": "16",
	"32nd": "32",
	"64th": "64",
	"128th": "128",
};

export function durationSymbol(type: string): string {
	return DURATION_SYMBOLS[type] ?? type;
}
