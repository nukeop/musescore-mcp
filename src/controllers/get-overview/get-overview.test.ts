import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { createScore } from "../../test/create-score";
import { getOverview } from "../../test/get-overview";
import "../../test/matchers";
import { BunFsMock } from "../../test/mocks/bun-fs";
import { createTestClient, type TestClient } from "../../test/test-setup";
import { textContent } from "../../test/tool-result";

describe("get_overview", () => {
	let mcp: TestClient;

	beforeEach(async () => {
		mcp = await createTestClient();
	});

	afterEach(async () => {
		BunFsMock.reset();
		await mcp.close();
	});

	test("summarizes a freshly created score", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp);
		const reads = BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await getOverview(mcp);

		expect(reads).toHaveBeenCalledWith("/scores/test-tune.mscx");
		expect(result.isError).toBeUndefined();
		expect(textContent(result)).toMatchSnapshot();
	});

	test("lists every instrument", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp, { instruments: ["tenor-saxophone", "piano"] });
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await getOverview(mcp);

		expect(result.isError).toBeUndefined();
		expect(textContent(result)).toMatchSnapshot();
	});

	test("summarizes example sheet", async () => {
		const reads = BunFsMock.spyOnFile();

		const result = await getOverview(mcp, "src/fixtures/simple-lead-sheet/simple-lead-sheet.mscx");

		expect(reads).toHaveBeenCalledWith("src/fixtures/simple-lead-sheet/simple-lead-sheet.mscx");
		expect(result.isError).toBeUndefined();
		expect(textContent(result)).toMatchSnapshot();
	});

	test("reports an error for a file that does not exist", async () => {
		const result = await getOverview(mcp, "/scores/missing.mscx");

		expect(result).toBeToolError("File not found: /scores/missing.mscx");
	});
});
