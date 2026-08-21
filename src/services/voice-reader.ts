import type { Element } from "@xmldom/xmldom";
import type { Chord, Duration, Note, Rest, Tuplet, Voice, VoiceEvent } from "../model/score";
import { child, childElements, children, numberIn, textIn } from "./score-dom";

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
				this.add(this.readChord(element));
				break;
			case "Rest":
				this.add(this.readRest(element));
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

	private readDuration(element: Element): Duration {
		const dots = child(element, "dots");
		return {
			type: textIn(element, "durationType"),
			dots: dots ? Number(dots.textContent) : 0,
		};
	}

	private readNote(element: Element): Note {
		const tpc2 = child(element, "tpc2");
		return {
			pitch: numberIn(element, "pitch"),
			tpc: numberIn(element, "tpc"),
			tpc2: tpc2 ? Number(tpc2.textContent) : undefined,
		};
	}
}
