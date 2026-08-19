import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { createScore } from "../../test/create-score";
import { BunFsMock } from "../../test/mocks/bun-fs";
import { createTestClient, type TestClient } from "../../test/test-setup";

describe("create_score", () => {
	let mcp: TestClient;

	beforeEach(async () => {
		BunFsMock.mockWrite();
		mcp = await createTestClient();
	});

	afterEach(async () => {
		BunFsMock.reset();
		await mcp.close();
	});

	test("creates a new file", async () => {
		const result = await createScore(mcp);

		expect(result.isError).toBeUndefined();
		expect(result.content).toEqual([{ type: "text", text: "Created /scores/test-tune.mscx" }]);
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("creates one part and staff per requested instrument", async () => {
		const result = await createScore(mcp, { instruments: ["tenor-saxophone", "piano"] });

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});
	// Raw tool call is needed here so this doesn't get rejected by type check
	test("rejects an unknown instrument and names the allowed ones", async () => {
		const result = await mcp.client.callTool({
			name: "create_score",
			arguments: {
				file: "/scores/test-tune.mscx",
				title: "Test Tune",
				composer: "Test Composer",
				instruments: ["kazoo"],
				key: "Cm",
				time: "4/4",
				tempo: 160,
				measures: 32,
			},
		});

		expect(result.isError).toBe(true);
		expect(result.content).toEqual([
			{
				type: "text",
				text: 'MCP error -32602: Input validation error: Invalid arguments for tool create_score: Invalid option: expected one of "piano"|"electric-guitar"|"acoustic-bass"|"electric-bass"|"trumpet"|"soprano-saxophone"|"alto-saxophone"|"tenor-saxophone"|"baritone-saxophone" at instruments[0]',
			},
		]);
	});
});
