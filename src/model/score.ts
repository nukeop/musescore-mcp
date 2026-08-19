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

export interface Chord {
	kind: "chord";
}

export interface Rest {
	kind: "rest";
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
