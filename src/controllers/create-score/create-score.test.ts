import { afterEach, beforeEach, describe, test } from "bun:test";
import { createTestClient, type TestClient } from "../../test/test-setup";

describe("create_score", () => {
	let mcp: TestClient;

	beforeEach(async () => {
		mcp = await createTestClient();
	});

	afterEach(async () => {
		await mcp.close();
	});

	test.todo("reports the created file path in the tool output", () => {});
	test.todo("writes the title and composer into the header frame", () => {});
	test.todo("creates the requested number of measures filled with whole rests", () => {});
	test.todo("starts bar 1 with the key signature, time signature, and tempo", () => {});
	test.todo("writes the transposition and written key for a transposing instrument", () => {});
	test.todo("creates one part and staff per requested instrument", () => {});
	test.todo("rejects an unknown instrument and names the known ones", () => {});
});
