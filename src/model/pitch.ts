export function noteName(tpc: number, midi: number): string {
	const letter = "FCGDAEB".charAt((tpc + 1) % 7);
	const alteration = Math.floor((tpc + 1) / 7) - 2;
	const octave = Math.floor((midi - alteration) / 12) - 1;
	return `${letter}${accidental(alteration)}${octave}`;
}

function accidental(alteration: number): string {
	if (alteration < 0) {
		return "♭".repeat(-alteration);
	}
	return "♯".repeat(alteration);
}
