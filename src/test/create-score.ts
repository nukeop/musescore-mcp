import type { CreateScoreArgs } from "../controllers/create-score/create-score.schema";
import type { TestClient } from "./test-setup";

export function createScore(mcp: TestClient, overrides: Partial<CreateScoreArgs> = {}) {
	return mcp.client.callTool({
		name: "create_score",
		arguments: {
			file: "/scores/test-tune.mscx",
			title: "Test Tune",
			composer: "Test Composer",
			instruments: ["tenor-saxophone"],
			key: "Cm",
			time: "4/4",
			tempo: 160,
			measures: 32,
			...overrides,
		},
	});
}
