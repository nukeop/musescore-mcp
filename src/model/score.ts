export interface ScoreHeader {
	title: string;
	composer: string;
}

export interface ScorePart {
	name: string;
	transposeChromatic: number;
}

export interface KeySig {
	concertKey: number;
}

export interface TimeSig {
	beats: number;
	beatUnit: number;
}

export interface Tempo {
	quarterNotesPerSecond: number;
}

export interface Duration {
	type: string;
	dots: number;
}

export interface Note {
	pitch: number;
	tpc: number;
	tpc2?: number;
}

export interface Chord {
	kind: "chord";
	duration: Duration;
	notes: Note[];
}

export interface Rest {
	kind: "rest";
	duration: Duration;
}

export type VoiceEvent = Chord | Rest;

export interface Voice {
	events: VoiceEvent[];
}

export interface Measure {
	keySig?: KeySig;
	timeSig?: TimeSig;
	tempo?: Tempo;
	voices: Voice[];
}

export interface Score {
	header: ScoreHeader;
	parts: ScorePart[];
	staves: Measure[][];
}
