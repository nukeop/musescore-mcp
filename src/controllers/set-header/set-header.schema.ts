import { z } from "zod";

export type SetHeaderArgs = z.input<z.ZodObject<typeof setHeaderSchema>>;

export const setHeaderSchema = {
	file: z.string(),
	title: z.string().optional(),
	subtitle: z.string().optional(),
	composer: z.string().optional(),
	lyricist: z.string().optional(),
};
