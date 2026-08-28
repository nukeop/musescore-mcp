import { keyName } from "../../model/keys";
import type { FormText, Measure, MeasureForm, VoltaStart } from "../../model/score";
import { bpm } from "../../model/tempo";
import { defaultHook } from "../../services/structure/volta";

export function formLines(measures: Measure[]): string[] {
	return measures.flatMap((measure, index) => {
		const entries = formEntries(measure, index + 1);
		if (entries.length === 0) {
			return [];
		}
		return [`  ${index + 1}: ${entries.join(" | ")}`];
	});
}

function formEntries(measure: Measure, bar: number): string[] {
	return [
		...markEntries(measure.form),
		...startRepeatEntries(measure.form),
		...endRepeatEntries(measure.form),
		...barlineEntries(measure.form),
		...signatureEntries(measure, bar),
		...measure.form.texts.map(textEntry),
		...measure.form.voltas.map(voltaEntry),
		...breakEntries(measure.form),
	];
}

function markEntries(form: MeasureForm): string[] {
	if (form.rehearsalMark === undefined) {
		return [];
	}
	return [`section "${form.rehearsalMark}"`];
}

function startRepeatEntries(form: MeasureForm): string[] {
	if (!form.startRepeat) {
		return [];
	}
	return ["start-repeat"];
}

function endRepeatEntries(form: MeasureForm): string[] {
	if (form.endRepeat === undefined) {
		return [];
	}
	return [`end-repeat x${form.endRepeat}`];
}

function barlineEntries(form: MeasureForm): string[] {
	if (form.barline === undefined) {
		return [];
	}
	return [`${form.barline} barline`];
}

function signatureEntries(measure: Measure, bar: number): string[] {
	if (bar === 1) {
		return [];
	}
	return [...keyEntries(measure), ...timeEntries(measure), ...tempoEntries(measure)];
}

function keyEntries({ keySig }: Measure): string[] {
	if (!keySig) {
		return [];
	}
	return [`key: ${keyName(keySig.concertKey)}`];
}

function timeEntries({ timeSig }: Measure): string[] {
	if (!timeSig) {
		return [];
	}
	return [`time: ${timeSig.beats}/${timeSig.beatUnit}`];
}

function tempoEntries({ tempo }: Measure): string[] {
	if (!tempo) {
		return [];
	}
	return [`tempo: ${bpm(tempo)} bpm`];
}

function textEntry(text: FormText): string {
	if (text.swing !== undefined) {
		return `swing: ${text.swing} "${text.text}"`;
	}
	return `${text.style} text "${text.text}"`;
}

function voltaEntry(volta: VoltaStart): string {
	return `volta ${volta.ending} (${voltaRange(volta)}${voltaHookSuffix(volta)})`;
}

function voltaRange({ from, to }: VoltaStart): string {
	if (from === to) {
		return `bar ${from}`;
	}
	return `bars ${from}-${to}`;
}

function voltaHookSuffix(volta: VoltaStart): string {
	if (volta.hook === defaultHook(volta.ending)) {
		return "";
	}
	return `, ${volta.hook}`;
}

function breakEntries(form: MeasureForm): string[] {
	if (form.layoutBreak === undefined) {
		return [];
	}
	return [`${form.layoutBreak} break`];
}
