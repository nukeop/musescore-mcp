import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { createScore } from "../../test/create-score";
import { createMockFileSystem } from "../../test/mock-file-system";
import { createTestClient, type TestClient } from "../../test/test-setup";

describe("create_score", () => {
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

	test("creates a new file", async () => {
		const result = await createScore(mcp);

		expect(result.isError).toBeUndefined();
		expect(result.content).toEqual([{ type: "text", text: `Created ${SCORE_FILE}` }]);
		expect(files.writtenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("creates one part and staff per requested instrument", async () => {
		const result = await createScore(mcp, { instruments: ["tenor-saxophone", "piano"] });

		expect(result.isError).toBeUndefined();
		expect(files.writtenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});
	test("rejects an unknown instrument and names the known ones", async () => {
		const result = await createScore(mcp, { instruments: ["kazoo"] });

		expect(result.isError).toBe(true);
		expect(result.content).toEqual([
			{
				type: "text",
				text: 'Unknown instrument "kazoo". Known instruments: piano, guitar, bass, flute, trumpet, tenor-saxophone, soprano-saxophone, clarinet, alto-saxophone, baritone-saxophone.',
			},
		]);
	});
});
