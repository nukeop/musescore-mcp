import type { CompatibilityCallToolResult, TextContent } from "@modelcontextprotocol/sdk/types.js";

export const textContent = (result: CompatibilityCallToolResult): string =>
	(result as { content: [TextContent] }).content[0].text;
