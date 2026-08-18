import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { createMockFileSystem } from "../../test/mock-file-system";
import { createTestClient, type TestClient } from "../../test/test-setup";

const FILE = "/scores/test-tune.mscx";

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
		const result = await mcp.client.callTool({
			name: "create_score",
			arguments: {
				file: FILE,
				title: "Test Tune",
				composer: "Test Composer",
				instruments: ["tenor-saxophone"],
				key: "Cm",
				time: "4/4",
				tempo: 160,
				measures: 32,
			},
		});

		expect(result.isError).toBeUndefined();
		expect(result.content).toEqual([{ type: "text", text: `Created ${FILE}` }]);

		expect(files.writtenFile(FILE)).toMatchSnapshot();
	});

	test.todo("writes the title and composer into the header frame", () => {});
	test.todo("creates the requested number of measures filled with whole rests", () => {});
	test.todo("starts bar 1 with the key signature, time signature, and tempo", () => {});
	test.todo("writes the transposition and written key for a transposing instrument", () => {});
	test.todo("creates one part and staff per requested instrument", () => {});
	test.todo("rejects an unknown instrument and names the known ones", () => {});
});
