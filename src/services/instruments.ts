export type PitchRange = {
	min: number;
	max: number;
};

export type Transposition = {
	diatonic: number;
	chromatic: number;
};

export type Clefs = {
	concert: string;
	transposing: string;
};

export type InstrumentDefinition = {
	museScoreId: string;
	longName: string;
	shortName: string;
	instrumentId: string;
	program: number;
	professionalRange: PitchRange;
	amateurRange: PitchRange;
	transposition?: Transposition;
	clefs?: Clefs;
};

const catalog: Record<string, InstrumentDefinition> = {
	piano: {
		museScoreId: "piano",
		longName: "Piano",
		shortName: "Pno.",
		instrumentId: "keyboard.piano",
		program: 0,
		professionalRange: { min: 21, max: 108 },
		amateurRange: { min: 21, max: 108 },
	},
	"electric-guitar": {
		museScoreId: "electric-guitar",
		longName: "Electric Guitar",
		shortName: "El. Guit.",
		instrumentId: "pluck.guitar.electric",
		program: 27,
		professionalRange: { min: 40, max: 88 },
		amateurRange: { min: 40, max: 86 },
		clefs: { concert: "G8vb", transposing: "G8vb" },
	},
	"acoustic-bass": {
		museScoreId: "acoustic-bass",
		longName: "Acoustic Bass",
		shortName: "Bass",
		instrumentId: "pluck.bass.acoustic",
		program: 32,
		professionalRange: { min: 28, max: 67 },
		amateurRange: { min: 28, max: 62 },
		transposition: { diatonic: -7, chromatic: -12 },
		clefs: { concert: "F8vb", transposing: "F" },
	},
	"electric-bass": {
		museScoreId: "electric-bass",
		longName: "Electric Bass",
		shortName: "El. B.",
		instrumentId: "pluck.bass.electric",
		program: 33,
		professionalRange: { min: 28, max: 67 },
		amateurRange: { min: 28, max: 65 },
		transposition: { diatonic: -7, chromatic: -12 },
		clefs: { concert: "F8vb", transposing: "F" },
	},
	trumpet: {
		museScoreId: "bb-trumpet",
		longName: "Trumpet",
		shortName: "Tpt.",
		instrumentId: "brass.trumpet.bflat",
		program: 56,
		professionalRange: { min: 52, max: 85 },
		amateurRange: { min: 52, max: 80 },
		transposition: { diatonic: -1, chromatic: -2 },
	},
	"soprano-saxophone": {
		museScoreId: "soprano-saxophone",
		longName: "Soprano Saxophone",
		shortName: "S. Sax.",
		instrumentId: "wind.reed.saxophone.soprano",
		program: 64,
		professionalRange: { min: 56, max: 91 },
		amateurRange: { min: 56, max: 87 },
		transposition: { diatonic: -1, chromatic: -2 },
	},
	"alto-saxophone": {
		museScoreId: "alto-saxophone",
		longName: "Alto Saxophone",
		shortName: "A. Sax.",
		instrumentId: "wind.reed.saxophone.alto",
		program: 65,
		professionalRange: { min: 49, max: 92 },
		amateurRange: { min: 49, max: 80 },
		transposition: { diatonic: -5, chromatic: -9 },
	},
	"tenor-saxophone": {
		museScoreId: "tenor-saxophone",
		longName: "Tenor Saxophone",
		shortName: "T. Sax.",
		instrumentId: "wind.reed.saxophone.tenor",
		program: 66,
		professionalRange: { min: 44, max: 87 },
		amateurRange: { min: 44, max: 75 },
		transposition: { diatonic: -8, chromatic: -14 },
		clefs: { concert: "G8vb", transposing: "G" },
	},
	"baritone-saxophone": {
		museScoreId: "baritone-saxophone",
		longName: "Baritone Saxophone",
		shortName: "Bar. Sax.",
		instrumentId: "wind.reed.saxophone.baritone",
		program: 67,
		professionalRange: { min: 36, max: 80 },
		amateurRange: { min: 36, max: 68 },
		transposition: { diatonic: -12, chromatic: -21 },
		clefs: { concert: "F", transposing: "G" },
	},
};

export const instrumentNames = Object.keys(catalog);

export function findInstrument(name: string): InstrumentDefinition | undefined {
	return catalog[name];
}
