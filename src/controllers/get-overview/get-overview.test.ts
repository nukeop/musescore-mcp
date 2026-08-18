import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { createScore } from "../../test/create-score";
import { getOverview } from "../../test/get-overview";
import { createMockFileSystem } from "../../test/mock-file-system";
import { createTestClient, type TestClient } from "../../test/test-setup";
import { textContent } from "../../test/tool-result";

describe("get_overview", () => {
	const files = createMockFileSystem();
	let mcp: TestClient;

	beforeEach(async () => {
		files.beforeEach();
		mcp = await createTestClient();
	});

	afterEach(async () => {
		files.afterEach();
		await mcp.close();
	});

	test("summarizes a freshly created score", async () => {
		await createScore(mcp);

		const result = await getOverview(mcp);

		expect(result.isError).toBeUndefined();
		expect(textContent(result)).toMatchSnapshot();
	});

	test("summarizes example sheet", async () => {
		const result = await getOverview(mcp, "src/fixtures/simple-lead-sheet/simple-lead-sheet.mscx");

		expect(result.isError).toBeUndefined();
		expect(textContent(result)).toMatchSnapshot();
	});

	test("reports an error for a file that does not exist", async () => {
		const result = await getOverview(mcp, "/scores/missing.mscx");

		expect(result.isError).toBe(true);
		expect(result.content).toEqual([{ type: "text", text: "File not found: /scores/missing.mscx" }]);
	});
});
