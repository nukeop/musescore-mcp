import type { Document, Element, Node } from "@xmldom/xmldom";
import type {
	KeySig,
	Measure,
	Score,
	ScoreHeader,
	ScorePart,
	Tempo,
	TimeSig,
	Voice,
	VoiceEvent,
} from "../model/score";

export class ScoreReader {
	private readonly score: Element;

	constructor(document: Document) {
		const score = scoreElementOf(document);
		if (score === undefined) {
			throw new Error("Not a MuseScore file");
		}
		this.score = score;
	}

	read(): Score {
		return {
			header: this.readHeader(),
			parts: children(this.score, "Part").map((part) => this.readPart(part)),
			staves: children(this.score, "Staff").map((staff) => this.readStaff(staff)),
		};
	}

	private readHeader(): ScoreHeader {
		return { title: this.headerText("title"), composer: this.headerText("composer") };
	}

	private headerText(style: string): string {
		const texts = children(this.score, "Staff").flatMap((staff) =>
			children(staff, "VBox").flatMap((vBox) => children(vBox, "Text")),
		);
		const match = texts.find((text) => textIn(text, "style") === style);
		if (match === undefined) {
			return "";
		}
		return textIn(match, "text");
	}

	private readPart(element: Element): ScorePart {
		const instrument = child(element, "Instrument");
		if (instrument === undefined) {
			return { name: "", transposeChromatic: 0 };
		}
		return {
			name: textIn(instrument, "longName"),
			transposeChromatic: this.readTranspose(instrument),
		};
	}

	private readTranspose(instrument: Element): number {
		const transpose = child(instrument, "transposeChromatic");
		if (transpose === undefined) {
			return 0;
		}
		return Number(transpose.textContent);
	}

	private readStaff(element: Element): Measure[] {
		return children(element, "Measure").map((measure) => this.readMeasure(measure));
	}

	private readKeySig(voice: Element): KeySig | undefined {
		const keySig = child(voice, "KeySig");
		if (keySig === undefined) {
			return undefined;
		}
		return { concertKey: numberIn(keySig, "concertKey") };
	}

	private readTimeSig(voice: Element): TimeSig | undefined {
		const timeSig = child(voice, "TimeSig");
		if (timeSig === undefined) {
			return undefined;
		}
		return { beats: numberIn(timeSig, "sigN"), beatUnit: numberIn(timeSig, "sigD") };
	}

	private readTempo(voice: Element): Tempo | undefined {
		const tempo = child(voice, "Tempo");
		if (tempo === undefined) {
			return undefined;
		}
		return { quarterNotesPerSecond: numberIn(tempo, "tempo") };
	}

	private readMeasure(element: Element): Measure {
		const voices = children(element, "voice");
		const [first] = voices;
		if (first === undefined) {
			return { voices: [] };
		}
		return {
			keySig: this.readKeySig(first),
			timeSig: this.readTimeSig(first),
			tempo: this.readTempo(first),
			voices: voices.map((voice) => this.readVoice(voice)),
		};
	}

	private readVoice(element: Element): Voice {
		const events = Array.from(element.childNodes)
			.filter((node): node is Element => node.nodeType === node.ELEMENT_NODE)
			.flatMap((node) => this.readEvent(node));
		return { events };
	}

	private readEvent(element: Element): VoiceEvent[] {
		if (element.nodeName === "Chord") {
			return [{ kind: "chord" }];
		}
		if (element.nodeName === "Rest") {
			return [{ kind: "rest" }];
		}
		return [];
	}
}

function children(parent: Node, name: string): Element[] {
	return Array.from(parent.childNodes).filter(
		(node): node is Element => node.nodeType === node.ELEMENT_NODE && node.nodeName === name,
	);
}

function child(parent: Node, name: string): Element | undefined {
	return children(parent, name)[0];
}

function numberIn(parent: Element, name: string): number {
	return Number(child(parent, name)?.textContent);
}

function textIn(parent: Element, name: string): string {
	return child(parent, name)?.textContent ?? "";
}

function scoreElementOf(document: Document): Element | undefined {
	if (document.documentElement?.nodeName !== "museScore") {
		return undefined;
	}
	return child(document.documentElement, "Score");
}
