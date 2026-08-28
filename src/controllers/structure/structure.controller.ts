import type { Controller } from "../../server";
import { ScoreFile } from "../../services/score-file";
import { BarlineWriter } from "../../services/structure/barline";
import { RehearsalMarkWriter } from "../../services/structure/rehearsal-mark";
import { textResult } from "../tool-response";
import { setBarlineSchema, setSectionMarkerSchema } from "./structure.schema";

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

	server.registerTool(
		"set_barline",
		{
			description:
				"Sets the barline type at a measure: start-repeat, end-repeat (with an optional play count, default 2), double, or normal to clear any override.",
			inputSchema: setBarlineSchema,
		},
		async ({ file, measure, type, count }) => {
			if (count !== undefined && type !== "end-repeat") {
				throw new Error("Count is only valid with type end-repeat");
			}
			const scoreFile = await ScoreFile.open(file);
			const score = scoreFile.read();

			const writer = new BarlineWriter(scoreFile, score.staves);
			switch (type) {
				case "start-repeat":
					writer.startRepeat(measure);
					break;
				case "end-repeat":
					writer.endRepeat(measure, count);
					break;
				case "double":
					writer.double(measure);
					break;
				case "normal":
					writer.clear(measure);
					break;
			}

			await scoreFile.save();
			return textResult(`Set ${type} barline at measure ${measure} in ${file}`);
		},
	);
};
