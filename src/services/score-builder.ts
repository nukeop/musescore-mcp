import { DOMImplementation, XMLSerializer } from "@xmldom/xmldom";
import { KEY_FIFTHS } from "../model/keys";
import type { Clefs, InstrumentDefinition, Transposition } from "./instruments";

type ScoreState = {
	readonly title: string;
	readonly composer: string;
	readonly concertFifths: number;
	readonly beats: number;
	readonly beatUnit: number;
	readonly tempo: number;
	readonly measures: number;
	readonly instruments: readonly InstrumentDefinition[];
};

const document = new DOMImplementation().createDocument(null, "fragment");
const serializer = new XMLSerializer();

function xmlText(value: string): string {
	return serializer.serializeToString(document.createTextNode(value));
}

export class ScoreBuilder {
	private constructor(private readonly state: ScoreState) {}

	static create(): ScoreBuilder {
		return new ScoreBuilder({
			title: "",
			composer: "",
			concertFifths: 0,
			beats: 4,
			beatUnit: 4,
			tempo: 120,
			measures: 32,
			instruments: [],
		});
	}

	withTitle(title: string): ScoreBuilder {
		return new ScoreBuilder({ ...this.state, title });
	}

	withComposer(composer: string): ScoreBuilder {
		return new ScoreBuilder({ ...this.state, composer });
	}

	withKey(key: string): ScoreBuilder {
		const concertFifths = KEY_FIFTHS[key];
		if (concertFifths === undefined) {
			throw new Error(`Unknown key "${key}"`);
		}
		return new ScoreBuilder({ ...this.state, concertFifths });
	}

	withTime(time: string): ScoreBuilder {
		const match = time.match(/^(\d+)\/(\d+)$/);
		if (match === null) {
			throw new Error(`Invalid time signature "${time}"`);
		}
		const [, beats, beatUnit] = match;
		return new ScoreBuilder({ ...this.state, beats: Number(beats), beatUnit: Number(beatUnit) });
	}

	withTempo(tempo: number): ScoreBuilder {
		return new ScoreBuilder({ ...this.state, tempo });
	}

	withMeasures(measures: number): ScoreBuilder {
		return new ScoreBuilder({ ...this.state, measures });
	}

	withInstrument(definition: InstrumentDefinition): ScoreBuilder {
		return new ScoreBuilder({ ...this.state, instruments: [...this.state.instruments, definition] });
	}

	build(): string {
		const parts = this.state.instruments
			.map((definition, index) => this.renderPart(index + 1, definition))
			.join("\n");
		return `<?xml version="1.0" encoding="UTF-8"?>
<museScore version="4.50">
  <Score>
    <Division>480</Division>
    <metaTag name="arranger"></metaTag>
    <metaTag name="audioComUrl"></metaTag>
    <metaTag name="composer">${xmlText(this.state.composer)}</metaTag>
    <metaTag name="copyright"></metaTag>
    <metaTag name="lyricist"></metaTag>
    <metaTag name="movementNumber"></metaTag>
    <metaTag name="movementTitle"></metaTag>
    <metaTag name="platform"></metaTag>
    <metaTag name="poet"></metaTag>
    <metaTag name="source"></metaTag>
    <metaTag name="sourceRevisionId"></metaTag>
    <metaTag name="subtitle"></metaTag>
    <metaTag name="translator"></metaTag>
    <metaTag name="workNumber"></metaTag>
    <metaTag name="workTitle">${xmlText(this.state.title)}</metaTag>
${parts}
    </Score>
  </museScore>
`;
	}

	private renderPart(id: number, definition: InstrumentDefinition): string {
		return `    <Part id="${id}">
      <Staff id="${id}">
        <StaffType group="pitched">
          <name>stdNormal</name>
          </StaffType>${this.staffClefLines(definition.clefs)}
        </Staff>
      <trackName>${definition.longName}</trackName>
      <Instrument id="${definition.museScoreId}">
        <longName>${definition.longName}</longName>
        <shortName>${definition.shortName}</shortName>
        <trackName>${definition.longName}</trackName>
        <minPitchP>${definition.professionalRange.min}</minPitchP>
        <maxPitchP>${definition.professionalRange.max}</maxPitchP>
        <minPitchA>${definition.amateurRange.min}</minPitchA>
        <maxPitchA>${definition.amateurRange.max}</maxPitchA>${this.transpositionLines(definition.transposition)}
        <instrumentId>${definition.instrumentId}</instrumentId>${this.instrumentClefLines(definition.clefs)}
        <Channel>
          <program value="${definition.program}"/>
          <synti>Fluid</synti>
          </Channel>
        </Instrument>
      </Part>`;
	}

	private staffClefLines(clefs: Clefs | undefined): string {
		if (clefs === undefined) {
			return "";
		}
		if (clefs.concert === clefs.transposing) {
			return `
        <defaultClef>${clefs.concert}</defaultClef>`;
		}
		return `
        <defaultConcertClef>${clefs.concert}</defaultConcertClef>
        <defaultTransposingClef>${clefs.transposing}</defaultTransposingClef>`;
	}

	private instrumentClefLines(clefs: Clefs | undefined): string {
		if (clefs === undefined || clefs.concert === clefs.transposing) {
			return "";
		}
		return `
        <concertClef>${clefs.concert}</concertClef>
        <transposingClef>${clefs.transposing}</transposingClef>`;
	}

	private transpositionLines(transposition: Transposition | undefined): string {
		if (transposition === undefined) {
			return "";
		}
		return `
        <transposeDiatonic>${transposition.diatonic}</transposeDiatonic>
        <transposeChromatic>${transposition.chromatic}</transposeChromatic>`;
	}
}
