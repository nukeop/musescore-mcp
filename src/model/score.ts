import type { Element } from "@xmldom/xmldom";
import type { AnnotationName } from "./annotations";
import type { MscxDurationType } from "./duration-tables";
import type { EnclosureName } from "./enclosures";
export interface ScoreHeader {
	title: string;
	composer: string;
}

export interface ScorePart {
	name: string;
	transposeDiatonic: number;
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
	type: MscxDurationType;
	dots: number;
}

export interface Note {
	pitch: number;
	tpc: number;
	tpc2?: number;
	tied?: boolean;
	glissando?: boolean;
}

export interface Harmony {
	root: number;
	name: string;
}

export interface Chord {
	kind: "chord";
	duration: Duration;
	notes: Note[];
	harmony?: Harmony;
	annotation?: AnnotationName;
	grace?: boolean;
	opensEnclosure?: EnclosureName;
	closesEnclosure?: EnclosureName;
}

export interface Rest {
	kind: "rest";
	duration: Duration;
	harmony?: Harmony;
}

export interface Tuplet {
	kind: "tuplet";
	actualNotes: number;
	normalNotes: number;
	events: VoiceEvent[];
}

export type VoiceEvent = Chord | Rest | Tuplet;

export interface Voice {
	events: VoiceEvent[];
}

export interface Measure {
	element: Element;
	keySig?: KeySig;
	timeSig?: TimeSig;
	tempo?: Tempo;
	voices: Voice[];
}

export interface Staff {
	part: ScorePart;
	measures: Measure[];
}

export interface Score {
	header: ScoreHeader;
	parts: ScorePart[];
	staves: Staff[];
}
