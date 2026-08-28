import type { TestClient } from "./test-setup";

export function setBarline(
	mcp: TestClient,
	file: string,
	{ measure, type, count }: { measure: number; type: string; count?: number },
) {
	return mcp.client.callTool({
		name: "set_barline",
		arguments: { file, measure, type, count },
	});
}
