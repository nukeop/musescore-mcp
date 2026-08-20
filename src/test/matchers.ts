import { expect } from "bun:test";

declare module "bun:test" {
	interface Matchers<T> {
		toBeToolError(message: string): T;
	}
}

type ToolResult = { isError?: boolean; content?: unknown };

expect.extend({
	toBeToolError(received, message: string) {
		const result = received as ToolResult;
		const expectedContent = [{ type: "text", text: message }];
		const pass = result.isError && Bun.deepEquals(result.content, expectedContent, true);
		return {
			pass: Boolean(pass),
			message: () =>
				`expected a tool error ${JSON.stringify(message)}, received isError=${result.isError} content=${JSON.stringify(result.content)}`,
		};
	},
});
