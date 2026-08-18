import type { TestClient } from "./test-setup";

export function getOverview(mcp: TestClient, file = "/scores/test-tune.mscx") {
	return mcp.client.callTool({
		name: "get_overview",
		arguments: { file },
	});
}
