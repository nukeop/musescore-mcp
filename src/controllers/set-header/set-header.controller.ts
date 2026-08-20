import type { Controller } from "../../server";
import { ScoreFile } from "../../services/score-file";
import { textResult } from "../tool-response";
import { editHeader } from "./header-edit";
import { setHeaderSchema } from "./set-header.schema";

export const setHeaderController: Controller = (server) => {
	server.registerTool(
		"set_header",
		{
			description:
				"Sets the header frame texts of a score: title, subtitle, composer, lyricist. Only the given fields change. Creates the header frame when the score has none.",
			inputSchema: setHeaderSchema,
		},
		async ({ file, ...fields }) => {
			const scoreFile = await ScoreFile.open(file);
			editHeader(scoreFile, fields);
			await scoreFile.save();
			return textResult(`Updated header of ${file}`);
		},
	);
};
