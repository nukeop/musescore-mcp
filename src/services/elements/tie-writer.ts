import type { Document, Element } from "@xmldom/xmldom";
import type Fraction from "fraction.js";
import type { Chord } from "../../model/score";
import { children, elementWithText } from "../score-dom";

interface LastChord {
	chord: Chord;
	element: Element;
	position: Fraction;
	barOffset: number;
}

export class TieWriter {
	private lastChord: LastChord | undefined;

	constructor(private readonly document: Document) {}

	endTie(chord: Chord, element: Element, position: Fraction): void {
		this.lastChord = { chord, element, position, barOffset: 0 };
	}

	clear(): void {
		this.lastChord = undefined;
	}

	startBar(): void {
		if (this.lastChord) {
			this.lastChord = { ...this.lastChord, barOffset: this.lastChord.barOffset + 1 };
		}
	}

	startTie(): void {
		this.lastChord = undefined;
	}
}
