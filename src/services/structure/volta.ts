import type { Document, Element } from "@xmldom/xmldom";
import Fraction from "fraction.js";
import type { Measure, Staff, VoltaHook, VoltaStart } from "../../model/score";
import { effectiveTimeSigAt } from "../effective-time-sig";
import { assertMeasureInRange } from "../measure-range";
import {
	child,
	children,
	elementWithText,
	firstEvent,
	firstSpannerOrEvent,
	numberIn,
	textIn,
} from "../score-dom";
import type { ScoreFile } from "../score-file";

export interface VoltaRange {
	from: number;
	to: number;
}

const CLOSED_HOOK_TYPE = "1";

export function readVoltaStarts(voice: Element, from: number): VoltaStart[] {
	return voltaStartsIn(voice).map((start) => readVoltaStart(start, from));
}

function readVoltaStart(spanner: Element, from: number): VoltaStart {
	const volta = child(spanner, "Volta")!;
	return {
		ending: numberIn(volta, "endings"),
		from,
		to: from + coveredMeasures(spanner) - 1,
		hook: hookOf(volta),
	};
}

function hookOf(volta: Element): VoltaHook {
	if (textIn(volta, "endHookType") === CLOSED_HOOK_TYPE) {
		return "closed";
	}
	return "open";
}

interface VoltaLocation {
	measures: number;
	fractions?: Fraction;
}

export function buildVoltaStart(
	document: Document,
	ending: number,
	closed: boolean,
	location: VoltaLocation,
): Element {
	const spanner = voltaSpanner(document);
	const volta = document.createElement("Volta");
	if (closed) {
		volta.appendChild(elementWithText(document, "endHookType", CLOSED_HOOK_TYPE));
	}
	volta.appendChild(elementWithText(document, "beginText", `${ending}.`));
	volta.appendChild(elementWithText(document, "endings", String(ending)));
	spanner.appendChild(volta);
	spanner.appendChild(locationLink(document, "next", location, 1));
	return spanner;
}

export function buildVoltaAnchor(document: Document, location: VoltaLocation): Element {
	const spanner = voltaSpanner(document);
	spanner.appendChild(locationLink(document, "prev", location, -1));
	return spanner;
}

export class VoltaWriter {
	constructor(
		private readonly scoreFile: ScoreFile,
		private readonly staves: Staff[],
	) {}

	add(range: VoltaRange, ending: number, hook?: VoltaHook): void {
		if (range.from > range.to) {
			throw new Error(
				`Volta range ${range.from}-${range.to} is inverted (from exceeds to): ${this.scoreFile.path}`,
			);
		}
		assertMeasureInRange(this.staves, range.to, this.scoreFile.path);
		this.assertNoOverlap(range);

		const closed = (hook ?? defaultHook(ending)) === "closed";
		const endsOnFinalMeasure = range.to === this.measureCount();
		const location = this.locationFor(range, endsOnFinalMeasure);

		const startVoice = this.voice(range.from);
		const start = buildVoltaStart(this.scoreFile.document, ending, closed, location);
		startVoice.insertBefore(start, firstEvent(startVoice) ?? null);

		this.placeAnchor(buildVoltaAnchor(this.scoreFile.document, location), range, endsOnFinalMeasure);
	}

	private locationFor({ from, to }: VoltaRange, endsOnFinalMeasure: boolean): VoltaLocation {
		if (endsOnFinalMeasure) {
			const timeSig = effectiveTimeSigAt(this.firstStaffMeasures(), to);
			return { measures: to - from, fractions: new Fraction(timeSig.beats, timeSig.beatUnit) };
		}
		return { measures: to - from + 1 };
	}

	private placeAnchor(anchor: Element, { to }: VoltaRange, endsOnFinalMeasure: boolean): void {
		if (endsOnFinalMeasure) {
			this.voice(to).appendChild(anchor);
		} else {
			const voice = this.voice(to + 1);
			voice.insertBefore(anchor, firstSpannerOrEvent(voice) ?? null);
		}
	}

	private assertNoOverlap(range: VoltaRange): void {
		const overlapping = this.existingVoltas().find(
			(volta) => volta.from <= range.to && range.from <= volta.to,
		);
		if (overlapping) {
			throw new Error(
				`Volta ${range.from}-${range.to} overlaps the existing volta at bars ${overlapping.from}-${overlapping.to}: ${this.scoreFile.path}`,
			);
		}
	}

	private existingVoltas(): VoltaRange[] {
		return this.firstStaffMeasures().flatMap((measure, index) =>
			readVoltaStarts(child(measure.element, "voice")!, index + 1),
		);
	}

	private voice(measure: number): Element {
		return child(this.firstStaffMeasures()[measure - 1]!.element, "voice")!;
	}

	private measureCount(): number {
		return this.firstStaffMeasures().length;
	}

	private firstStaffMeasures(): Measure[] {
		return this.staves[0]!.measures;
	}
}

export function defaultHook(ending: number): VoltaHook {
	if (ending === 1) {
		return "closed";
	}
	return "open";
}

function voltaSpanner(document: Document): Element {
	const spanner = document.createElement("Spanner");
	spanner.setAttribute("type", "Volta");
	return spanner;
}

function locationLink(
	document: Document,
	name: string,
	{ measures, fractions }: VoltaLocation,
	sign: number,
): Element {
	const link = document.createElement(name);
	const location = document.createElement("location");
	if (measures !== 0) {
		location.appendChild(elementWithText(document, "measures", String(sign * measures)));
	}
	if (fractions) {
		location.appendChild(elementWithText(document, "fractions", formatFraction(fractions.mul(sign))));
	}
	link.appendChild(location);
	return link;
}

function formatFraction(fraction: Fraction): string {
	if (fraction.s < 0) {
		return `-${fraction.n}/${fraction.d}`;
	}
	return `${fraction.n}/${fraction.d}`;
}

function voltaStartsIn(voice: Element): Element[] {
	return children(voice, "Spanner").filter(
		(spanner) => spanner.getAttribute("type") === "Volta" && child(spanner, "Volta") !== undefined,
	);
}

function coveredMeasures(start: Element): number {
	const location = child(child(start, "next")!, "location")!;
	const crossed = Number(child(location, "measures")?.textContent ?? "0");
	if (child(location, "fractions")) {
		return crossed + 1;
	}
	return crossed;
}
