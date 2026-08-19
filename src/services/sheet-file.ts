export class SheetFile {
	private constructor(
		readonly path: string,
		readonly xml: string,
	) {}

	static async open(path: string): Promise<SheetFile> {
		const source = Bun.file(path);
		if (!(await source.exists())) {
			throw new Error(`File not found: ${path}`);
		}
		return new SheetFile(path, await source.text());
	}
}
