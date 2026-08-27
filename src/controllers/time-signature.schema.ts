import { z } from "zod";
import type { TimeSig } from "../model/score";

export const timeSignature = z
	.templateLiteral([z.number().int().positive(), "/", z.number().int().positive()])
	.transform((value): TimeSig => {
		const match = value.match(/^(?<beats>\d+)\/(?<beatUnit>\d+)$/);
		return { beats: Number(match?.groups?.beats), beatUnit: Number(match?.groups?.beatUnit) };
	});
