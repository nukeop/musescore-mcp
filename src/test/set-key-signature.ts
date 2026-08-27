import type { TestClient } from "./test-setup";

export function setKeySignature(
	mcp: TestClient,
	file: string,
	{ measure, key }: { measure: number; key: string },
) {
	return mcp.client.callTool({
		name: "set_key_signature",
		arguments: { file, measure, key },
	});
}
