import type { TestClient } from "./test-setup";

export function setSectionMarker(
	mcp: TestClient,
	file: string,
	{ measure, text }: { measure: number; text: string },
) {
	return mcp.client.callTool({
		name: "set_section_marker",
		arguments: { file, measure, text },
	});
}
