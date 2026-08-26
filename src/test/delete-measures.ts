import type { TestClient } from "./test-setup";

export function deleteMeasures(
	mcp: TestClient,
	file: string,
	{ from, to }: { from: number; to: number },
) {
	return mcp.client.callTool({
		name: "delete_measures",
		arguments: { file, from, to },
	});
}
