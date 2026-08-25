import type { Element } from "@xmldom/xmldom";
import type { MscxDurationType } from "../model/duration-tables";
import type { Chord, Duration, Harmony, Note, Rest, Tuplet, Voice, VoiceEvent } from "../model/score";
import { child, childElements, children, numberIn, precedingElement, textIn } from "./score-dom";

export class VoiceReader {
	private readonly events: VoiceEvent[] = [];
	private readonly openTuplets: Tuplet[] = [];

	constructor(private readonly voice: Element) {}

	read(): Voice {
		for (const element of childElements(this.voice)) {
			this.readElement(element);
		}
		return { events: this.events };
	}

	private readElement(element: Element): void {
		switch (element.nodeName) {
			case "Tuplet":
				this.openTuplet(this.readTuplet(element));
				break;
			case "endTuplet":
				this.openTuplets.pop();
				break;
			case "Chord":
				this.add({ ...this.readChord(element), harmony: this.readHarmonyBefore(element) });
				break;
			case "Rest":
				this.add({ ...this.readRest(element), harmony: this.readHarmonyBefore(element) });
				break;
		}
	}

	private openTuplet(tuplet: Tuplet): void {
		this.add(tuplet);
		this.openTuplets.push(tuplet);
	}

	private add(event: VoiceEvent): void {
		const target = this.openTuplets.at(-1)?.events ?? this.events;
		target.push(event);
	}

	private readTuplet(element: Element): Tuplet {
		return {
			kind: "tuplet",
			actualNotes: numberIn(element, "actualNotes"),
			normalNotes: numberIn(element, "normalNotes"),
			events: [],
		};
	}

	// Every melody note is inside a "Chord" event, even if there's no actual chord inside
	private readChord(element: Element): Chord {
		return {
			kind: "chord",
			duration: this.readDuration(element),
			notes: children(element, "Note").map((note) => this.readNote(note)),
		};
	}

	private readRest(element: Element): Rest {
		return { kind: "rest", duration: this.readDuration(element) };
	}

	private readHarmonyBefore(element: Element): Harmony | undefined {
		const prev = precedingElement(element);
		if (!prev || prev.nodeName !== "Harmony") {
			return undefined;
		}
		return { root: numberIn(prev, "root"), name: textIn(prev, "name") };
	}

	private readDuration(element: Element): Duration {
		const dots = child(element, "dots");
		return {
			type: textIn(element, "durationType") as MscxDurationType,
			dots: dots ? Number(dots.textContent) : 0,
		};
	}

	private readNote(element: Element): Note {
		const tpc2 = child(element, "tpc2");
		return {
			pitch: numberIn(element, "pitch"),
			tpc: numberIn(element, "tpc"),
			tpc2: tpc2 ? Number(tpc2.textContent) : undefined,
			tied: children(element, "Spanner").some(
				(spanner) => spanner.getAttribute("type") === "Tie" && Boolean(child(spanner, "next")),
			),
		};
	}
}
