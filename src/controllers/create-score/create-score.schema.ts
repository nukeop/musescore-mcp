import { z } from "zod";
import { keyNames } from "../../model/keys";
import { instrumentNames } from "../../services/instruments";

export type CreateScoreArgs = z.input<z.ZodObject<typeof createScoreSchema>>;

export const createScoreSchema = {
	file: z.string(),
	title: z.string(),
	composer: z.string(),
	instruments: z.array(z.enum(instrumentNames)),
	key: z.enum(keyNames),
	time: z
		.templateLiteral([z.number().int().positive(), "/", z.number().int().positive()])
		.default("4/4")
		.transform((value) => {
			const match = value.match(/^(?<beats>\d+)\/(?<beatUnit>\d+)$/);
			return { beats: Number(match?.groups?.beats), beatUnit: Number(match?.groups?.beatUnit) };
		}),
	tempo: z
		.number()
		.positive()
		.transform((bpm) => ({ bpm, quarterNotesPerSecond: Math.round((bpm / 60) * 1_000_000) / 1_000_000 })),
	measures: z.number().int().positive(),
};
