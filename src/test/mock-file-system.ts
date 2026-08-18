import { spyOn } from "bun:test";

export function createMockFileSystem() {
	const written = new Map<string, string>();
	let writeSpy: ReturnType<typeof spyOnWrite>;

	function spyOnWrite() {
		return spyOn(Bun, "write").mockImplementation(async (destination, content) => {
			written.set(String(destination), String(content));
			return 0;
		});
	}

	return {
		beforeEach: () => {
			written.clear();
			writeSpy = spyOnWrite();
		},
		afterEach: () => {
			writeSpy.mockRestore();
		},
		writtenFile: (path: string) => written.get(path)!,
	};
}
