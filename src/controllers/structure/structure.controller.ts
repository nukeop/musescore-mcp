import type { Controller } from "../../server";
import { ScoreFile } from "../../services/score-file";
import { RehearsalMarkWriter } from "../../services/structure/rehearsal-mark";
import { textResult } from "../tool-response";
import { setSectionMarkerSchema } from "./structure.schema";

export const structureController: Controller = (server) => {
	server.registerTool(
		"set_section_marker",
		{
			description:
				"Sets a rehearsal mark with the given text at a measure, replacing any existing mark there.",
			inputSchema: setSectionMarkerSchema,
		},
		async ({ file, measure, text }) => {
			const scoreFile = await ScoreFile.open(file);
			const score = scoreFile.read();

			new RehearsalMarkWriter(scoreFile, score.staves).set(measure, text);

			await scoreFile.save();
			return textResult(`Set section marker "${text}" at measure ${measure} in ${file}`);
		},
	);
};
