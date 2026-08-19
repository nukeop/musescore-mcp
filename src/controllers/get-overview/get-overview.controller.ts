import type { Controller } from "../../server";
import { SheetFile } from "../../services/sheet-file";
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
			await SheetFile.open(file);
			return { content: [] };
		},
	);
};
