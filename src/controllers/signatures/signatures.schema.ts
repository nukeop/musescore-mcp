import { z } from "zod";
import { KEY_NAMES } from "../../model/keys";

export const setKeySignatureSchema = {
	file: z.string(),
	measure: z.number().int().min(1),
	key: z.enum(KEY_NAMES),
};
