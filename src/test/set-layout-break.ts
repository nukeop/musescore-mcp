import type { TestClient } from "./test-setup";

export function setLayoutBreak(
	mcp: TestClient,
	file: string,
	{ measure, type }: { measure: number; type: string },
) {
	return mcp.client.callTool({
		name: "set_layout_break",
		arguments: { file, measure, type },
	});
}
