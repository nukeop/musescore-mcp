import type { TestClient } from "./test-setup";

export function addVolta(
	mcp: TestClient,
	file: string,
	{ from, to, ending, hook }: { from: number; to: number; ending: number; hook?: string },
) {
	return mcp.client.callTool({
		name: "add_volta",
		arguments: { file, from, to, ending, hook },
	});
}
