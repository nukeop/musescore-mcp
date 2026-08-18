import { z } from "zod";

export const createScoreSchema = {
	file: z.string(),
	title: z.string(),
	composer: z.string(),
	instruments: z.array(z.string()),
	key: z.string(),
	time: z.string(),
	tempo: z.number(),
	measures: z.number().int().positive(),
};
