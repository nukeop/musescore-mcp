export class ScoreFile {
	private constructor(
		readonly path: string,
		readonly xml: string,
	) {}

	static async open(path: string): Promise<ScoreFile> {
		const source = Bun.file(path);
		if (!(await source.exists())) {
			throw new Error(`File not found: ${path}`);
		}
		return new ScoreFile(path, await source.text());
	}
}
