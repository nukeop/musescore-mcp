import type { TestClient } from "./test-setup";

export function setText(
	mcp: TestClient,
	file: string,
	{ measure, text, style, swing }: { measure: number; text: string; style: string; swing?: string },
) {
	return mcp.client.callTool({
		name: "set_text",
		arguments: { file, measure, text, style, swing },
	});
}
