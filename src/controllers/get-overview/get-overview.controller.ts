import type { Controller } from "../../server";
import { ScoreFile } from "../../services/score-file";
import { textResult } from "../tool-response";
import { getOverviewSchema } from "./get-overview.schema";
import { OverviewRenderer } from "./overview-renderer";

export const getOverviewController: Controller = (server) => {
	server.registerTool(
		"get_overview",
		{
			description:
				"Returns the chart summary: header texts, instruments with transposition, key and time signatures, tempo, bar count, and which bars contain melody.",
			inputSchema: getOverviewSchema,
		},
		async ({ file }) => {
			const scoreFile = await ScoreFile.open(file);
			return textResult(new OverviewRenderer(scoreFile.read()).render());
		},
	);
};
