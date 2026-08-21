import type { TestClient } from "./test-setup";

export function writeMeasures(
	mcp: TestClient,
	file: string,
	{ staff, from, content }: { staff?: number; from: number; content: string },
) {
	return mcp.client.callTool({
		name: "write_measures",
		arguments: { file, staff, from, content },
	});
}
