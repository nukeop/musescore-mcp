import { mock, spyOn } from "bun:test";
import type { BunFile } from "bun";

const writtenFiles = new Map<string, string>();

export const BunFsMock = {
	mockWrite: () =>
		spyOn(Bun, "write").mockImplementation(async (destination, content) => {
			writtenFiles.set(String(destination), String(content));
			return 0;
		}),

	mockFile: (files: Record<string, string> = {}) =>
		spyOn(Bun, "file").mockImplementation(
			((path: string) =>
				({
					exists: async () => writtenFiles.has(path) || path in files,
					text: async () => writtenFiles.get(path) ?? files[path],
				}) as BunFile) as typeof Bun.file,
		),

	mockNoFile: () =>
		spyOn(Bun, "file").mockImplementation(
			((path: string) =>
				({
					text: async () => {
						throw new Error(`ENOENT: no such file or directory, open '${path}'`);
					},
				}) as unknown as BunFile) as typeof Bun.file,
		),

	spyOnFile: () => spyOn(Bun, "file"),

	getWrittenFile: (path: string) => writtenFiles.get(path) as string,

	reset: () => {
		mock.restore();
		writtenFiles.clear();
	},
};
