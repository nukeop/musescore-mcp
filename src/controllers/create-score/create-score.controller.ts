import type { Controller } from "../../server";
import { createScoreSchema } from "./create-score.schema";

export const createScoreController: Controller = (server) => {
	server.registerTool(
		"create_score",
		{
			description:
				"Creates a new .mscx score file with a header, instruments, key and time signatures, a tempo marker, and empty measures.",
			inputSchema: createScoreSchema,
		},
		async () => {

		},
	);
};
