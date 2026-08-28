import type { Tempo } from "./score";

export function bpm(tempo: Tempo): number {
	return Math.round(tempo.quarterNotesPerSecond * 60);
}
