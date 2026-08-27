import type { TestClient } from "./test-setup";

export function setTimeSignature(
	mcp: TestClient,
	file: string,
	{ measure, time }: { measure: number; time: string },
) {
	return mcp.client.callTool({
		name: "set_time_signature",
		arguments: { file, measure, time },
	});
}
