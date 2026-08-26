export type AnnotationName = "staccato" | "accent" | "shortTrill" | "mordent" | "scoop";

export type Annotation = {
	dsl: string;
	xmlElement: "Articulation" | "Ornament" | "ChordLine";
	xmlSubtype: string;
	xmlParent: "chord" | "note";
	readSubtypes: string[];
};

export const ANNOTATIONS: Record<AnnotationName, Annotation> = {
	staccato: {
		dsl: "'",
		xmlElement: "Articulation",
		xmlSubtype: "articStaccatoAbove",
		xmlParent: "chord",
		readSubtypes: ["articStaccatoAbove", "articStaccatoBelow"],
	},
	accent: {
		dsl: ">",
		xmlElement: "Articulation",
		xmlSubtype: "articAccentAbove",
		xmlParent: "chord",
		readSubtypes: ["articAccentAbove", "articAccentBelow"],
	},
	shortTrill: {
		dsl: "(tr)",
		xmlElement: "Ornament",
		xmlSubtype: "ornamentShortTrill",
		xmlParent: "chord",
		readSubtypes: ["ornamentShortTrill"],
	},
	mordent: {
		dsl: "(mord)",
		xmlElement: "Ornament",
		xmlSubtype: "ornamentMordent",
		xmlParent: "chord",
		readSubtypes: ["ornamentMordent"],
	},
	scoop: {
		dsl: "(scoop)",
		xmlElement: "ChordLine",
		xmlSubtype: "4",
		xmlParent: "note",
		readSubtypes: ["4"],
	},
};

export const ANNOTATION_NAMES: AnnotationName[] = ["staccato", "accent", "shortTrill", "mordent", "scoop"];
