import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import * as fs from "node:fs/promises";
import { createScore } from "../../test/create-score";
import { BunFsMock } from "../../test/mocks/bun-fs";
import { createTestClient, type TestClient } from "../../test/test-setup";

// Read before any test mocks Bun.file.
const jazzTemplate = await Bun.file(new URL("../../styles/jazz.mss", import.meta.url)).text();

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

	test("derives the concert key by inverting the first instrument's transposition", async () => {
		const result = await createScore(mcp, { instruments: ["alto-saxophone", "tenor-saxophone"], key: "D" });

		expect(result.isError).toBeUndefined();
		const file = BunFsMock.getWrittenFile("/scores/test-tune.mscx");
		expect(file).toContain("<KeySig><concertKey>-1</concertKey><actualKey>2</actualKey></KeySig>");
		expect(file).toContain("<KeySig><concertKey>-1</concertKey><actualKey>1</actualKey></KeySig>");
	});

	test("writes the jazz style template next to the score", async () => {
		const result = await createScore(mcp, { style: "jazz" });

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/score_style.mss")).toBe(jazzTemplate);
	});

	test("writes no style file for the standard style, which is the default", async () => {
		const result = await createScore(mcp);

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/score_style.mss")).toBeUndefined();
	});

	test("refuses the jazz style in a directory that holds another score, and writes nothing", async () => {
		BunFsMock.mockFile({ "/scores/other-tune.mscx": "", "/scores/score_style.mss": "" });

		const result = await createScore(mcp, { style: "jazz" });

		expect(result.isError).toBe(true);
		expect(result.content).toEqual([
			{
				type: "text",
				text: "Cannot apply the jazz style to /scores/test-tune.mscx because /scores also holds other-tune.mscx. MuseScore applies score_style.mss to every .mscx in a directory, so the score needs its own folder.",
			},
		]);
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/score_style.mss")).toBeUndefined();
	});

	test("refuses the jazz style next to another score with an upper-case .MSCX extension", async () => {
		BunFsMock.mockFile({ "/scores/OTHER-TUNE.MSCX": "" });

		const result = await createScore(mcp, { style: "jazz" });

		expect(result.isError).toBe(true);
		expect(result.content).toEqual([
			{
				type: "text",
				text: "Cannot apply the jazz style to /scores/test-tune.mscx because /scores also holds OTHER-TUNE.MSCX. MuseScore applies score_style.mss to every .mscx in a directory, so the score needs its own folder.",
			},
		]);
	});

	test("allows the jazz style when recreating the same score path", async () => {
		BunFsMock.mockFile({ "/scores/test-tune.mscx": "", "/scores/score_style.mss": "" });

		const result = await createScore(mcp, { style: "jazz" });

		expect(result.isError).toBeUndefined();
		expect(result.content).toEqual([{ type: "text", text: "Created /scores/test-tune.mscx" }]);
		expect(BunFsMock.getWrittenFile("/scores/score_style.mss")).toBe(jazzTemplate);
	});

	test("writes nothing when the jazz template cannot be read", async () => {
		spyOn(fs, "readFile").mockRejectedValue(new Error("EACCES: permission denied"));

		const result = await createScore(mcp, { style: "jazz" });

		expect(result.isError).toBe(true);
		expect(result.content).toEqual([{ type: "text", text: "EACCES: permission denied" }]);
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/score_style.mss")).toBeUndefined();
	});

	test("refuses the standard style next to an existing score_style.mss, and writes nothing", async () => {
		BunFsMock.mockFile({ "/scores/score_style.mss": "" });

		const result = await createScore(mcp);

		expect(result.isError).toBe(true);
		expect(result.content).toEqual([
			{
				type: "text",
				text: "Cannot create /scores/test-tune.mscx with the standard style because /scores holds score_style.mss, and MuseScore would apply that file to this score. Create the score in a folder without score_style.mss.",
			},
		]);
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toBeUndefined();
	});

	test("refuses to recreate a jazz score as standard, and keeps the jazz score", async () => {
		await createScore(mcp, { style: "jazz" });
		const jazzScore = BunFsMock.getWrittenFile("/scores/test-tune.mscx");

		const result = await createScore(mcp, { title: "Standard Tune" });

		expect(result.isError).toBe(true);
		expect(result.content).toEqual([
			{
				type: "text",
				text: "Cannot create /scores/test-tune.mscx with the standard style because /scores holds score_style.mss, and MuseScore would apply that file to this score. Create the score in a folder without score_style.mss.",
			},
		]);
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toBe(jazzScore);
		expect(BunFsMock.getWrittenFile("/scores/score_style.mss")).toBe(jazzTemplate);
	});

	test("allows the standard style in a folder shared with other scores", async () => {
		BunFsMock.mockFile({ "/scores/other-tune.mscx": "" });

		const result = await createScore(mcp);

		expect(result.isError).toBeUndefined();
		expect(result.content).toEqual([{ type: "text", text: "Created /scores/test-tune.mscx" }]);
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
