import type { Controller } from "../../server";
import { ScoreFile } from "../../services/score-file";
import { getOverviewSchema } from "./get-overview.schema";

export const getOverviewController: Controller = (server) => {
	server.registerTool(
		"get_overview",
		{
			description:
				"Returns the chart summary: header texts, instruments with transposition, key and time signatures, tempo, bar count, and which bars contain melody.",
			inputSchema: getOverviewSchema,
		},
		async ({ file }) => {
			await ScoreFile.open(file);
			return { content: [] };
		},
	);
};
