import type { TestClient } from "./test-setup";

export function setText(
	mcp: TestClient,
	file: string,
	{ measure, text, style }: { measure: number; text: string; style: string },
) {
	return mcp.client.callTool({
		name: "set_text",
		arguments: { file, measure, text, style },
	});
}
