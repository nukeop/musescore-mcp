import type { Controller } from "../../server";
import { findInstrument } from "../../services/instruments";
import { ScoreBuilder } from "../../services/score-builder";
import { createScoreSchema } from "./create-score.schema";

export const createScoreController: Controller = (server) => {
	server.registerTool(
		"create_score",
		{
			description:
				"Creates a new .mscx score file with a header, instruments, key and time signatures, a tempo marker, and empty measures.",
			inputSchema: createScoreSchema,
		},
		async ({ file, title, composer, instruments, key, time, tempo, measures }) => {
			const score = ScoreBuilder.create()
				.withTitle(title)
				.withComposer(composer)
				.withKey(key)
				.withTime(time)
				.withTempo(tempo)
				.withMeasures(measures)
				.withInstruments(instruments.map((name) => findInstrument(name)))
				.build();
			await Bun.write(file, score);
			return { content: [{ type: "text", text: `Created ${file}` }] };
		},
	);
};
