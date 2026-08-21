import type { Controller } from "../../server";
import { readMeasuresSchema, writeMeasuresSchema } from "./measures.schema";

export const measuresController: Controller = (server) => {
	server.registerTool(
		"read_measures",
		{
			description:
				"Returns the bar notation for a range of measures: notes as written pitch, rests, durations with dots, separated by |.",
			inputSchema: readMeasuresSchema,
		},
		async ({ file, from, to, staff }) => {},
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
