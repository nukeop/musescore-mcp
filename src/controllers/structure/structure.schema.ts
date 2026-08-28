import { z } from "zod";

export const setSectionMarkerSchema = {
	file: z.string(),
	measure: z.number().int().min(1),
	text: z.string(),
};

export const setBarlineSchema = {
	file: z.string(),
	measure: z.number().int().min(1),
	type: z.enum(["start-repeat", "end-repeat", "double", "normal"]),
	count: z.number().int().positive().optional(),
};
