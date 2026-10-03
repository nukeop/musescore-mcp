import type { Controller } from "../../server";
import { findInstrument } from "../../services/instruments";
import { ScoreBuilder } from "../../services/score-builder";
import { ScoreStyleFile } from "../../services/score-style";
import { textResult } from "../tool-response";
import { createScoreSchema } from "./create-score.schema";

export const createScoreController: Controller = (server) => {
	server.registerTool(
		"create_score",
		{
			description:
				"Creates a new .mscx score file with a header, instruments, key and time signatures, a tempo marker, and empty measures. " +
				'style defaults to "standard", which uses MuseScore\'s default engraving. ' +
				'style "jazz" also writes score_style.mss next to the score, which gives it MuseJazz text fonts and an A4 page setup. ' +
				"MuseScore applies score_style.mss to every .mscx in the same directory. " +
				"So a jazz score needs its own folder, for example Title/Title.mscx, and the call fails if that folder already holds a different .mscx file. " +
				"A standard score can share a folder with other scores, but the call fails if the folder holds a score_style.mss, because MuseScore would apply that style to it.",
			inputSchema: createScoreSchema,
		},
		async ({ file, title, composer, instruments, key, time, tempo, measures, style }) => {
			const styleFile = await ScoreStyleFile.prepare(file, style);
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
			await styleFile.write();
			return textResult(`Created ${file}`);
		},
	);
};
