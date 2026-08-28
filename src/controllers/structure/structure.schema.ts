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

export const addVoltaSchema = {
	file: z.string(),
	from: z.number().int().min(1),
	to: z.number().int().min(1),
	ending: z.number().int().positive(),
	hook: z.enum(["closed", "open"]).optional(),
};

export const setLayoutBreakSchema = {
	file: z.string(),
	measure: z.number().int().min(1),
	type: z.enum(["system", "page", "section", "none"]),
};

export const setTextSchema = {
	file: z.string(),
	measure: z.number().int().min(1),
	text: z.string(),
	style: z.enum(["staff", "system"]),
};
