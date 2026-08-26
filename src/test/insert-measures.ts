import type { TestClient } from "./test-setup";

export function insertMeasures(
	mcp: TestClient,
	file: string,
	{ at, count }: { at: number; count: number },
) {
	return mcp.client.callTool({
		name: "insert_measures",
		arguments: { file, at, count },
	});
}
