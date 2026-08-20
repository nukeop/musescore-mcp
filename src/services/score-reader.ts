import type { Element } from "@xmldom/xmldom";
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
import { child, children, numberIn, textIn } from "./score-dom";

export class ScoreReader {
	constructor(private readonly score: Element) {}

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
		return match ? textIn(match, "text") : "";
	}

	private readPart(element: Element): ScorePart {
		const instrument = child(element, "Instrument");
		return instrument
			? {
					name: textIn(instrument, "longName"),
					transposeChromatic: this.readTranspose(instrument),
				}
			: { name: "", transposeChromatic: 0 };
	}

	private readTranspose(instrument: Element): number {
		const transpose = child(instrument, "transposeChromatic");
		return transpose ? Number(transpose.textContent) : 0;
	}

	private readStaff(element: Element): Measure[] {
		return children(element, "Measure").map((measure) => this.readMeasure(measure));
	}

	private readKeySig(voice: Element): KeySig | undefined {
		const keySig = child(voice, "KeySig");
		return keySig && { concertKey: numberIn(keySig, "concertKey") };
	}

	private readTimeSig(voice: Element): TimeSig | undefined {
		const timeSig = child(voice, "TimeSig");
		return timeSig && { beats: numberIn(timeSig, "sigN"), beatUnit: numberIn(timeSig, "sigD") };
	}

	private readTempo(voice: Element): Tempo | undefined {
		const tempo = child(voice, "Tempo");
		return tempo && { quarterNotesPerSecond: numberIn(tempo, "tempo") };
	}

	private readMeasure(element: Element): Measure {
		const voices = children(element, "voice");
		const [first] = voices;
		return first
			? {
					keySig: this.readKeySig(first),
					timeSig: this.readTimeSig(first),
					tempo: this.readTempo(first),
					voices: voices.map((voice) => this.readVoice(voice)),
				}
			: { voices: [] };
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
		} else if (element.nodeName === "Rest") {
			return [{ kind: "rest" }];
		} else {
			return [];
		}
	}
}
