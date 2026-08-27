import { z } from "zod";
import { KEY_NAMES } from "../../model/keys";
import { instrumentNames } from "../../services/instruments";
import { timeSignature } from "../time-signature.schema";

export type CreateScoreArgs = z.input<z.ZodObject<typeof createScoreSchema>>;

export const createScoreSchema = {
	file: z.string(),
	title: z.string(),
	composer: z.string(),
	instruments: z.array(z.enum(instrumentNames)),
	key: z.enum(KEY_NAMES),
	time: timeSignature.prefault("4/4"),
	tempo: z.number().positive(),
	measures: z.number().int().positive(),
};
