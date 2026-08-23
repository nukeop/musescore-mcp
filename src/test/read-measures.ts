import type { TestClient } from "./test-setup";

export function readMeasures(
	mcp: TestClient,
	file: string,
	{ staff, from, to }: { staff?: number; from: number; to: number },
) {
	return mcp.client.callTool({
		name: "read_measures",
		arguments: { file, staff, from, to },
	});
}
