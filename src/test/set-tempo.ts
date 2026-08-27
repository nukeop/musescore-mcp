import type { TestClient } from "./test-setup";

export function setTempo(
	mcp: TestClient,
	file: string,
	{ measure, bpm }: { measure: number; bpm: number },
) {
	return mcp.client.callTool({
		name: "set_tempo",
		arguments: { file, measure, bpm },
	});
}
