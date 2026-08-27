import type { Controller } from "../../server";
import { ScoreFile } from "../../services/score-file";
import { KeySignatureWriter } from "../../services/signatures/key-signature-writer";
import { textResult } from "../tool-response";
import { setKeySignatureSchema } from "./signatures.schema";

export const signaturesController: Controller = (server) => {
	server.registerTool(
		"set_key_signature",
		{
			description: "Sets a key signature change at the start of a measure, in all staves.",
			inputSchema: setKeySignatureSchema,
		},
		async ({ file, measure, key }) => {
			const scoreFile = await ScoreFile.open(file);
			const score = scoreFile.read();

			new KeySignatureWriter(scoreFile, score.staves).set(measure, key);

			await scoreFile.save();
			return textResult(`Set key signature ${key} at measure ${measure} in ${file}`);
		},
	);
};
