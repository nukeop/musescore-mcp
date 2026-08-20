import type { TestClient } from "./test-setup";

export function readMeasures(
	mcp: TestClient,
	file: string,
	{ from, to }: { from: number; to: number },
) {
	return mcp.client.callTool({
		name: "read_measures",
		arguments: { file, from, to },
	});
}
