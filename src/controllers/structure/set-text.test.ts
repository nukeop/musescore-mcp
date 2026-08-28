import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { createScore } from "../../test/create-score";
import "../../test/matchers";
import { BunFsMock } from "../../test/mocks/bun-fs";
import { setSectionMarker } from "../../test/set-section-marker";
import { setText } from "../../test/set-text";
import { createTestClient, type TestClient } from "../../test/test-setup";
import { writeMeasures } from "../../test/write-measures";

describe("set_text", () => {
	let mcp: TestClient;

	beforeEach(async () => {
		mcp = await createTestClient();
	});

	afterEach(async () => {
		BunFsMock.reset();
		await mcp.close();
	});

	test("(Snapshot) writes a staff text at a bar, on the first staff only", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano", "trumpet"], measures: 4 });

		const result = await setText(mcp, "/scores/test-tune.mscx", {
			measure: 2,
			text: "Solo",
			style: "staff",
		});

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("(Snapshot) writes a system text after an existing rehearsal mark", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		const setup = await setSectionMarker(mcp, "/scores/test-tune.mscx", { measure: 2, text: "A" });
		expect(setup.isError).toBeUndefined();

		const result = await setText(mcp, "/scores/test-tune.mscx", {
			measure: 2,
			text: "Swing",
			style: "system",
		});

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("(Snapshot) replaces an existing text of the same style", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		const setup = await setText(mcp, "/scores/test-tune.mscx", {
			measure: 2,
			text: "Solo",
			style: "staff",
		});
		expect(setup.isError).toBeUndefined();

		const result = await setText(mcp, "/scores/test-tune.mscx", {
			measure: 2,
			text: "Tutti",
			style: "staff",
		});

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("(Snapshot) staff and system text coexist at one bar", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		const setup = await setText(mcp, "/scores/test-tune.mscx", {
			measure: 2,
			text: "Solo",
			style: "staff",
		});
		expect(setup.isError).toBeUndefined();

		const result = await setText(mcp, "/scores/test-tune.mscx", {
			measure: 2,
			text: "Swing",
			style: "system",
		});

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("(Snapshot) keeps the text when the bar's content is rewritten", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });
		const setup = await setText(mcp, "/scores/test-tune.mscx", {
			measure: 2,
			text: "Solo",
			style: "staff",
		});
		expect(setup.isError).toBeUndefined();

		const result = await writeMeasures(mcp, "/scores/test-tune.mscx", { from: 2, content: "C4:1" });

		expect(result.isError).toBeUndefined();
		expect(BunFsMock.getWrittenFile("/scores/test-tune.mscx")).toMatchSnapshot();
	});

	test("rejects a measure beyond the end of the score", async () => {
		BunFsMock.mockWrite();
		BunFsMock.mockFile();
		await createScore(mcp, { instruments: ["piano"], measures: 4 });

		const result = await setText(mcp, "/scores/test-tune.mscx", {
			measure: 6,
			text: "Solo",
			style: "staff",
		});

		expect(result).toBeToolError(
			"Measure 6 exceeds score length (4 measures): /scores/test-tune.mscx",
		);
	});
});
