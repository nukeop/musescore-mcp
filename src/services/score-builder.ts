import { DOMImplementation, XMLSerializer } from "@xmldom/xmldom";
import { KEY_FIFTHS, type KeyName } from "../model/keys";
import type { Clefs, InstrumentDefinition, Transposition } from "./instruments";
import { buildKeySig } from "./signatures/key-signature-element";
import { buildTimeSig } from "./signatures/time-signature-element";

type ScoreState = {
	readonly title: string;
	readonly composer: string;
	readonly concertKey: number;
	readonly beats: number;
	readonly beatUnit: number;
	readonly tempo: { bpm: number; quarterNotesPerSecond: number };
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
			concertKey: 0,
			beats: 4,
			beatUnit: 4,
			tempo: { bpm: 120, quarterNotesPerSecond: 2 },
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

	withKey(key: KeyName): ScoreBuilder {
		return new ScoreBuilder({ ...this.state, concertKey: KEY_FIFTHS[key] });
	}

	withTime(time: { beats: number; beatUnit: number }): ScoreBuilder {
		return new ScoreBuilder({ ...this.state, beats: time.beats, beatUnit: time.beatUnit });
	}

	withTempo(tempo: { bpm: number; quarterNotesPerSecond: number }): ScoreBuilder {
		return new ScoreBuilder({ ...this.state, tempo });
	}

	withMeasures(measures: number): ScoreBuilder {
		return new ScoreBuilder({ ...this.state, measures });
	}

	withInstruments(definitions: readonly InstrumentDefinition[]): ScoreBuilder {
		return new ScoreBuilder({ ...this.state, instruments: definitions });
	}

	build(): string {
		const parts = this.state.instruments
			.map((definition, index) => this.renderPart(index + 1, definition))
			.join("\n");

		const staves = this.state.instruments
			.map((definition, index) => this.renderStaff(index + 1, definition))
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
${staves}
    </Score>
  </museScore>
`;
	}

	private renderStaff(id: number, definition: InstrumentDefinition): string {
		const restMeasures = `\n${this.renderRestMeasure()}`.repeat(this.state.measures - 1);
		if (id === 1) {
			return `    <Staff id="1">
${this.renderVBox()}
${this.renderFirstMeasure(definition, this.renderTempo())}${restMeasures}
      </Staff>`;
		}
		return `    <Staff id="${id}">
${this.renderFirstMeasure(definition, "")}${restMeasures}
      </Staff>`;
	}

	private renderVBox(): string {
		return `      <VBox>
        <height>10</height>
        <Text>
          <style>title</style>
          <text>${xmlText(this.state.title)}</text>
          </Text>
        <Text>
          <style>composer</style>
          <text>${xmlText(this.state.composer)}</text>
          </Text>
        </VBox>`;
	}

	private renderFirstMeasure(definition: InstrumentDefinition, tempo: string): string {
		return `      <Measure>
        <voice>
${this.renderKeySig(definition)}
${this.renderTimeSig()}${tempo}
          <Rest>
            <durationType>measure</durationType>
            </Rest>
          </voice>
        </Measure>`;
	}

	private renderTempo(): string {
		return `
          <Tempo>
            <tempo>${this.state.tempo.quarterNotesPerSecond}</tempo>
            <followText>1</followText>
            <text><sym>metNoteQuarterUp</sym> = ${this.state.tempo.bpm}</text>
            </Tempo>`;
	}

	private renderKeySig(definition: InstrumentDefinition): string {
		const keySig = buildKeySig(document, this.state.concertKey, definition.transposition);
		return `          ${serializer.serializeToString(keySig)}`;
	}

	private renderTimeSig(): string {
		const timeSig = buildTimeSig(document, { beats: this.state.beats, beatUnit: this.state.beatUnit });
		return `          ${serializer.serializeToString(timeSig)}`;
	}

	private renderRestMeasure(): string {
		return `      <Measure>
        <voice>
          <Rest>
            <durationType>measure</durationType>
            </Rest>
          </voice>
        </Measure>`;
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
		if (!clefs) {
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
		if (!clefs || clefs.concert === clefs.transposing) {
			return "";
		}
		return `
        <concertClef>${clefs.concert}</concertClef>
        <transposingClef>${clefs.transposing}</transposingClef>`;
	}

	private transpositionLines(transposition: Transposition | undefined): string {
		return transposition
			? `
        <transposeDiatonic>${transposition.diatonic}</transposeDiatonic>
        <transposeChromatic>${transposition.chromatic}</transposeChromatic>`
			: "";
	}
}
