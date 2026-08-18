import type { TestClient } from "./test-setup";

export const SCORE_FILE = "/scores/test-tune.mscx";

type CreateScoreArgs = {
	file: string;
	title: string;
	composer: string;
	instruments: string[];
	key: string;
	time: string;
	tempo: number;
	measures: number;
};

export function createScore(mcp: TestClient, overrides: Partial<CreateScoreArgs> = {}) {
	return mcp.client.callTool({
		name: "create_score",
		arguments: {
			file: SCORE_FILE,
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
