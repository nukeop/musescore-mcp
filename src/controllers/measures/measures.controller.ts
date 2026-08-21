import type { Controller } from "../../server";
import { ScoreFile } from "../../services/score-file";
import { ScoreReader } from "../../services/score-reader";
import { readMeasuresSchema, writeMeasuresSchema } from "./measures.schema";

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
			const measures = score.staves[(staff ?? 1) - 1];

			if (!measures) {
				throw new Error(`No measures in staff ${staff}`);
			}

			if (to > measures.length) {
				throw new Error(
					`Measure range ${from}-${to} exceeds score length (${measures.length} measures): ${file}`,
				);
			}
		},
	);

	server.registerTool(
		"write_measures",
		{
			description:
				"Replaces the content of consecutive bars with the given notation. Bar separators define the bar count. Each bar must fill the time signature exactly.",
			inputSchema: writeMeasuresSchema,
		},
		async ({ file, from, content, staff }) => {},
	);
};
