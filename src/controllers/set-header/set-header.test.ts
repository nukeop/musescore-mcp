import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { createScore } from "../../test/create-score";
import { framelessScore } from "../../test/fixtures";
import "../../test/matchers";
import { BunFsMock } from "../../test/mocks/bun-fs";
import { setHeader } from "../../test/set-header";
import { createTestClient, type TestClient } from "../../test/test-setup";
import { textContent } from "../../test/tool-result";

describe("set_header", () => {
	let mcp: TestClient;

	beforeEach(async () => {
		mcp = await createTestClient();
	});

	afterEach(async () => {
		BunFsMock.reset();
		await mcp.close();
	});

	test("updates the title and composer texts in the header frame", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp);
		const reads = BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await setHeader(mcp, { title: "Blue Monk", composer: "Thelonious Monk" });

		expect(reads).toHaveBeenCalledWith("/scores/test-tune.mscx");
		expect(result.isError).toBeUndefined();
		expect(textContent(result)).toBe("Updated header of /scores/test-tune.mscx");
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("adds a text to the frame for a field the header does not have", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp);
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await setHeader(mcp, { subtitle: "Small Hours" });

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("creates the header frame when the score has none", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile({ "/scores/frameless.mscx": framelessScore() });

		const result = await setHeader(
			mcp,
			{ title: "Blue Monk", composer: "Thelonious Monk" },
			"/scores/frameless.mscx",
		);

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/frameless.mscx")).toMatchSnapshot();
	});

	test("clears a field given an empty string", async () => {
		BunFsMock.mockWrite();
		await createScore(mcp);
		BunFsMock.mockFile({
			"/scores/test-tune.mscx": BunFsMock.getWrittenFile("/scores/test-tune.mscx"),
		});

		const result = await setHeader(mcp, { composer: "" });

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("leaves a frameless score untouched when no fields are given", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile({ "/scores/frameless.mscx": framelessScore() });

		const result = await setHeader(mcp, {}, "/scores/frameless.mscx");

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/frameless.mscx")).toMatchSnapshot();
	});

	test("reports an error for a file that does not exist", async () => {
		const result = await setHeader(mcp, { title: "Blue Monk" }, "/scores/missing.mscx");

		expect(result).toBeToolError("File not found: /scores/missing.mscx");
	});

	test("reports an error for a file that is not a MuseScore score", async () => {
		BunFsMock.mockFile({ "/scores/song.xml": "<foo/>" });

		const result = await setHeader(mcp, { title: "Blue Monk" }, "/scores/song.xml");

		expect(result).toBeToolError("Not a MuseScore file: /scores/song.xml");
	});
});
