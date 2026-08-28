import { z } from "zod";

export const setSectionMarkerSchema = {
	file: z.string(),
	measure: z.number().int().min(1),
	text: z.string(),
};
