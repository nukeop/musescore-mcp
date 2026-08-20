import type { Document } from "@xmldom/xmldom";
import { z } from "zod";
import { child, scoreElementOf } from "./score-dom";

export const scoreIntegrity = z.custom<Document>().transform((document, ctx) => {
	const score = scoreElementOf(document);
	if (!score) {
		ctx.addIssue({ code: "custom", message: "Not a MuseScore file" });
		return z.NEVER;
	}
	const firstStaff = child(score, "Staff");
	if (!firstStaff) {
		ctx.addIssue({ code: "custom", message: "No staves in score" });
		return z.NEVER;
	}
	return { score, firstStaff };
});
