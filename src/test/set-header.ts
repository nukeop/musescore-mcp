import type { SetHeaderArgs } from "../controllers/set-header/set-header.schema";
import type { TestClient } from "./test-setup";

export function setHeader(
	mcp: TestClient,
	fields: Omit<SetHeaderArgs, "file">,
	file = "/scores/test-tune.mscx",
) {
	return mcp.client.callTool({
		name: "set_header",
		arguments: { file, ...fields },
	});
}
