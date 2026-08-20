import { findInstrument } from "../services/instruments";
import { ScoreBuilder } from "../services/score-builder";

export function framelessScore(): string {
	return ScoreBuilder.create()
		.withTitle("Fixture Tune")
		.withComposer("Fixture Composer")
		.withKey("C")
		.withMeasures(2)
		.withInstruments([findInstrument("piano")])
		.build()
		.replace(/ *<VBox>.*?<\/VBox>\n/s, "");
}
