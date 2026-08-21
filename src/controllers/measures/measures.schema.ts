import { z } from "zod";

export const readMeasuresSchema = {
	file: z.string(),
	from: z.number().int().min(1),
	to: z.number().int().min(1),
	staff: z.number().int().min(1).optional(),
};

export const writeMeasuresSchema = {
	file: z.string(),
	from: z.number().int().min(1),
	content: z.string(),
	staff: z.number().int().min(1).optional(),
};
