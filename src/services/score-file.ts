import type { Document, Element } from "@xmldom/xmldom";
import { DOMParser, XMLSerializer } from "@xmldom/xmldom";
import { scoreIntegrity } from "./score-integrity";

export class ScoreFile {
	private constructor(
		readonly path: string,
		readonly document: Document,
		readonly score: Element,
		readonly firstStaff: Element,
	) {}

	async save(): Promise<void> {
		await Bun.write(this.path, new XMLSerializer().serializeToString(this.document));
	}

	static async open(path: string): Promise<ScoreFile> {
		const document = new DOMParser().parseFromString(await Bun.file(path).text(), "text/xml");
		const integrity = scoreIntegrity.safeParse(document);
		if (!integrity.success) {
			const reasons = integrity.error.issues.map((issue) => issue.message).join(", ");
			throw new Error(`${reasons}: ${path}`);
		}
		return new ScoreFile(path, document, integrity.data.score, integrity.data.firstStaff);
	}
}
