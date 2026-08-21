import type { Element } from "@xmldom/xmldom";
import type {
	KeySig,
	Measure,
	Score,
	ScoreHeader,
	ScorePart,
	Staff,
	Tempo,
	TimeSig,
	Voice,
} from "../model/score";
import { child, children, numberIn, textIn } from "./score-dom";
import { VoiceReader } from "./voice-reader";

export class ScoreReader {
	constructor(private readonly score: Element) {}

	read(): Score {
		return {
			header: this.readHeader(),
			parts: children(this.score, "Part").map((part) => this.readPart(part)),
			staves: children(this.score, "Staff").map((staff) => this.readStaff(staff)),
		};
	}

	private partOf(staff: Element): Element {
		const staffId = staff.getAttribute("id");
		const part = children(this.score, "Part").find((candidate) =>
			children(candidate, "Staff").some((declared) => declared.getAttribute("id") === staffId),
		);
		if (!part) {
			throw new Error(`No part declares staff ${staffId}`);
		}
		return part;
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
					transposeDiatonic: this.readTransposeValue(instrument, "transposeDiatonic"),
					transposeChromatic: this.readTransposeValue(instrument, "transposeChromatic"),
				}
			: { name: "", transposeDiatonic: 0, transposeChromatic: 0 };
	}

	private readTransposeValue(instrument: Element, tag: string): number {
		const element = child(instrument, tag);
		return element ? Number(element.textContent) : 0;
	}

	private readStaff(element: Element): Staff {
		return {
			part: this.readPart(this.partOf(element)),
			measures: children(element, "Measure").map((measure) => this.readMeasure(measure)),
		};
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
		return new VoiceReader(element).read();
	}
}
