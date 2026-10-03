import * as fs from "node:fs/promises";
import { basename, dirname, extname, join } from "node:path";

export const SCORE_STYLES = ["standard", "jazz"] as const;
export type ScoreStyle = (typeof SCORE_STYLES)[number];

// MuseScore 4 reads the style of every .mscx in a directory from this one sibling file.
const STYLE_FILE_NAME = "score_style.mss";

const templates: Record<ScoreStyle, URL | undefined> = {
	standard: undefined,
	jazz: new URL("../styles/jazz.mss", import.meta.url),
};

// The score_style.mss that belongs to a new score. Prepare it before writing the score,
// so that a refused folder or an unreadable template leaves nothing half-created.
export class ScoreStyleFile {
	private constructor(
		readonly path: string,
		private readonly content: string | undefined,
	) {}

	async write(): Promise<void> {
		if (this.content === undefined) {
			return;
		}
		await Bun.write(this.path, this.content);
	}

	static async prepare(scorePath: string, style: ScoreStyle): Promise<ScoreStyleFile> {
		const directory = dirname(scorePath);
		const stylePath = join(directory, STYLE_FILE_NAME);
		const neighbours = await listDirectory(directory);
		const template = templates[style];
		if (!template) {
			assertNoStyleFile(scorePath, style, neighbours);
			return new ScoreStyleFile(stylePath, undefined);
		}
		assertOwnFolder(scorePath, style, neighbours);
		return new ScoreStyleFile(stylePath, await fs.readFile(template, "utf8"));
	}
}

function assertNoStyleFile(scorePath: string, style: ScoreStyle, neighbours: string[]): void {
	if (neighbours.includes(STYLE_FILE_NAME)) {
		throw new Error(
			`Cannot create ${scorePath} with the ${style} style because ${dirname(scorePath)} holds ${STYLE_FILE_NAME}, ` +
				`and MuseScore would apply that file to this score. Create the score in a folder without ${STYLE_FILE_NAME}.`,
		);
	}
}

function assertOwnFolder(scorePath: string, style: ScoreStyle, neighbours: string[]): void {
	const otherScores = neighbours.filter(
		(name) => extname(name).toLowerCase() === ".mscx" && name !== basename(scorePath),
	);
	if (otherScores.length > 0) {
		throw new Error(
			`Cannot apply the ${style} style to ${scorePath} because ${dirname(scorePath)} also holds ${otherScores.join(", ")}. ` +
				`MuseScore applies ${STYLE_FILE_NAME} to every .mscx in a directory, so the score needs its own folder.`,
		);
	}
}

async function listDirectory(directory: string): Promise<string[]> {
	try {
		return await fs.readdir(directory);
	} catch (error) {
		// Bun.write creates missing folders, so a folder that does not exist yet holds nothing.
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			return [];
		}
		throw error;
	}
}
