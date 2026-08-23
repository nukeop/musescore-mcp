import { parseDuration } from "../../model/duration-tables";
import type { Duration, ScorePart, Voice, VoiceEvent } from "../../model/score";
import { WrittenPitch } from "../../model/written-pitch";

export class MeasuresParser {
	constructor(
		private readonly notation: string,
		private readonly part: ScorePart,
	) {}

	parse(): Voice[] {
		return this.notation.split(" | ").map((bar) => this.parseBar(bar));
	}

	private parseBar(bar: string): Voice {
		const symbols = bar.split(" ");
		return { events: symbols.map((symbol) => this.parseSymbol(symbol)) };
	}

	private previousDuration: Duration | undefined;

	private parseSymbol(symbol: string): VoiceEvent {
		if (symbol === "R") {
			return { kind: "rest", duration: { type: "measure", dots: 0 } };
		}

		const { name, duration } = this.splitSymbol(symbol);

		if (name === "r") {
			return { kind: "rest", duration };
		}

		return {
			kind: "chord",
			duration,
			notes: [WrittenPitch.parse(name).toNote(this.part)],
		};
	}

	private splitSymbol(symbol: string): { name: string; duration: Duration } {
		const [name = symbol, durationPart] = symbol.split(":");

		if (!durationPart) {
			if (!this.previousDuration) {
				throw new Error(`Missing duration: ${symbol}`);
			}
			return { name, duration: this.previousDuration };
		}

		const duration = parseDuration(durationPart);
		this.previousDuration = duration;
		return { name, duration };
	}
}
