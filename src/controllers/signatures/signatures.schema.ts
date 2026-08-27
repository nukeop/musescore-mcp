import { z } from "zod";
import { KEY_NAMES } from "../../model/keys";
import { timeSignature } from "../time-signature.schema";

export const setKeySignatureSchema = {
	file: z.string(),
	measure: z.number().int().min(1),
	key: z.enum(KEY_NAMES),
};

export const setTimeSignatureSchema = {
	file: z.string(),
	measure: z.number().int().min(1),
	time: timeSignature,
};
