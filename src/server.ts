import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export type Controller = (server: McpServer) => void;

const controllers: Controller[] = [];

export function buildServer(): McpServer {
	const server = new McpServer({
		name: "musescore-mcp",
		version: "0.1.0",
	});

	controllers.forEach((register) => register(server));

	return server;
}
