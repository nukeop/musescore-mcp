import { z } from "zod";

export type GetOverviewArgs = z.input<z.ZodObject<typeof getOverviewSchema>>;

export const getOverviewSchema = {
	file: z.string(),
};
