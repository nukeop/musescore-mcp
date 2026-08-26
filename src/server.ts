import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createScoreController } from "./controllers/create-score/create-score.controller";
import { getOverviewController } from "./controllers/get-overview/get-overview.controller";
import { measuresController } from "./controllers/measures/measures.controller";
import { setHeaderController } from "./controllers/set-header/set-header.controller";

export type Controller = (server: McpServer) => void;

const controllers: Controller[] = [
	createScoreController,
	getOverviewController,
	measuresController,
	setHeaderController,
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
