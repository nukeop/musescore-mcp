import type { Controller } from "../../server";
import { ScoreFile } from "../../services/score-file";
import { ScoreReader } from "../../services/score-reader";
import { textResult } from "../tool-response";
import { readMeasuresSchema, writeMeasuresSchema } from "./measures.schema";
import { MeasuresRenderer } from "./measures-renderer";

export const measuresController: Controller = (server) => {
	server.registerTool(
		"read_measures",
		{
			description:
				"Returns the bar notation for a range of measures: notes as written pitch, rests, durations with dots, separated by |.",
			inputSchema: readMeasuresSchema,
		},
		async ({ file, from, to, staff }) => {
			const scoreFile = await ScoreFile.open(file);
			const score = new ScoreReader(scoreFile.score).read();
			const scoreStaff = score.staves[(staff ?? 1) - 1];

			if (!scoreStaff) {
				throw new Error(`No staff ${staff ?? 1} in ${file}`);
			}

			if (to > scoreStaff.measures.length) {
				throw new Error(
					`Measure range ${from}-${to} exceeds score length (${scoreStaff.measures.length} measures): ${file}`,
				);
			}

			const firstVoiceMeasures = scoreStaff.measures.slice(from - 1, to).map((m) => m.voices[0]);

			return textResult(new MeasuresRenderer(firstVoiceMeasures, scoreStaff.part).render());
		},
	);

	server.registerTool(
		"write_measures",
		{
			description:
				"Replaces the content of consecutive bars with the given notation. Bar separators define the bar count. Each bar must fill the time signature exactly.",
			inputSchema: writeMeasuresSchema,
		},
		async ({ file, from, content, staff }) => {
			const scoreFile = await ScoreFile.open(file);
			await scoreFile.save();
			return textResult(content);
		},
	);
};
