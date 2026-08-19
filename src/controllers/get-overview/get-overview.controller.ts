import type { Controller } from "../../server";
import { getOverviewSchema } from "./get-overview.schema";

export const getOverviewController: Controller = (server) => {
	server.registerTool(
		"get_overview",
		{
			description:
				"Returns the chart summary: header texts, instruments with transposition, key and time signatures, tempo, bar count, and which bars contain melody.",
			inputSchema: getOverviewSchema,
		},
		async () => ({ content: [] }),
	);
};
