import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createScoreController } from "./controllers/create-score/create-score.controller";
import { getOverviewController } from "./controllers/get-overview/get-overview.controller";
import { measuresController } from "./controllers/measures/measures.controller";
import { setHeaderController } from "./controllers/set-header/set-header.controller";
import { signaturesController } from "./controllers/signatures/signatures.controller";
import { structureController } from "./controllers/structure/structure.controller";

export type Controller = (server: McpServer) => void;

const controllers: Controller[] = [
	createScoreController,
	getOverviewController,
	measuresController,
	setHeaderController,
	signaturesController,
	structureController,
];

export function buildServer(): McpServer {
	const server = new McpServer({
		name: "musescore-mcp",
		version: "0.1.0",
	});

	controllers.forEach((register) => {
		register(server);
	});

	return server;
}
