import type { ScorePart, Voice } from "../../model/score";

export class MeasuresParser {
	constructor(
		private readonly notation: string,
		private readonly part: ScorePart,
	) {}

	parse(): Voice[] {
		return [];
	}
}
