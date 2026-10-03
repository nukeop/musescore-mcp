import { mock, spyOn } from "bun:test";
import * as fs from "node:fs/promises";
import { basename, dirname } from "node:path";
import type { BunFile } from "bun";

const writtenFiles = new Map<string, string>();
let mockedFiles: Record<string, string> = {};

// Lists the mocked files and every file written so far, so that no test lists a real directory.
function mockReaddir(): void {
	spyOn(fs, "readdir").mockImplementation((async (directory: string) => {
		const paths = new Set([...writtenFiles.keys(), ...Object.keys(mockedFiles)]);
		return [...paths].filter((path) => dirname(path) === directory).map((path) => basename(path));
	}) as unknown as typeof fs.readdir);
}

export const BunFsMock = {
	mockWrite: () => {
		mockReaddir();
		return spyOn(Bun, "write").mockImplementation(async (destination, content) => {
			writtenFiles.set(String(destination), String(content));
			return 0;
		});
	},

	mockFile: (files: Record<string, string> = {}) => {
		mockedFiles = files;
		mockReaddir();
		return spyOn(Bun, "file").mockImplementation(
			((path: string) =>
				({
					exists: async () => writtenFiles.has(path) || path in files,
					text: async () => writtenFiles.get(path) ?? files[path],
				}) as BunFile) as typeof Bun.file,
		);
	},

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
		mockedFiles = {};
	},
};
