import type { Document, Element, Node } from "@xmldom/xmldom";
import type { KeySig, Measure, Tempo, TimeSig, Voice, VoiceEvent } from "../model/score";

export class ScoreReader {
	constructor(document: Document) {
		if (document.documentElement?.nodeName !== "museScore") {
			throw new Error("Not a MuseScore file");
		}
	}

	readKeySig(voice: Element): KeySig | undefined {
		const keySig = child(voice, "KeySig");
		if (keySig === undefined) {
			return undefined;
		}
		return { concertKey: numberIn(keySig, "concertKey") };
	}

	readTimeSig(voice: Element): TimeSig | undefined {
		const timeSig = child(voice, "TimeSig");
		if (timeSig === undefined) {
			return undefined;
		}
		return { beats: numberIn(timeSig, "sigN"), beatUnit: numberIn(timeSig, "sigD") };
	}

	readTempo(voice: Element): Tempo | undefined {
		const tempo = child(voice, "Tempo");
		if (tempo === undefined) {
			return undefined;
		}
		return { quarterNotesPerSecond: numberIn(tempo, "tempo") };
	}

	readMeasure(element: Element): Measure {
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

	readVoice(element: Element): Voice {
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
