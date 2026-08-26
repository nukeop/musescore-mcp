import { ANNOTATION_NAMES, ANNOTATIONS, type AnnotationName } from "../model/annotations";
import type { Chord, Note } from "../model/score";

export type Suffix = {
	dsl: string;
	apply: (chord: Chord) => Chord;
	appliesTo: (chord: Chord) => boolean;
};

function spannerSuffix(dsl: string, isMarked: (note: Note) => boolean, mark: (note: Note) => Note): Suffix {
	return {
		dsl,
		apply: (chord) => ({ ...chord, notes: chord.notes.map(mark) }),
		appliesTo: (chord) => chord.notes.some(isMarked),
	};
}

function annotationSuffix(name: AnnotationName): Suffix {
	return {
		dsl: ANNOTATIONS[name].dsl,
		apply: (chord) => ({ ...chord, annotation: name }),
		appliesTo: (chord) => chord.annotation === name,
	};
}

export const SUFFIXES: Suffix[] = [
	spannerSuffix(
		"~",
		(note) => note.tied === true,
		(note) => ({ ...note, tied: true }),
	),
	...ANNOTATION_NAMES.map(annotationSuffix),
];

export function suffixForChar(char: string): Suffix | undefined {
	return SUFFIXES.find((suffix) => suffix.dsl === char);
}

export function suffixForParenName(name: string): Suffix | undefined {
	return SUFFIXES.find((suffix) => suffix.dsl === `(${name})`);
}
