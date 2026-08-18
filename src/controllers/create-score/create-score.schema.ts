import { z } from "zod";
import { keyNames } from "../../model/keys";
import { instrumentNames } from "../../services/instruments";

export type CreateScoreArgs = z.infer<z.ZodObject<typeof createScoreSchema>>;

export const createScoreSchema = {
	file: z.string(),
	title: z.string(),
	composer: z.string(),
	instruments: z.array(z.enum(instrumentNames)),
	key: z.enum(keyNames),
	time: z.string().regex(/^\d+\/\d+$/),
	tempo: z.number().positive(),
	measures: z.number().int().positive(),
};
