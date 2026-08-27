import type { Controller } from "../../server";
import { ScoreFile } from "../../services/score-file";
import { KeySignatureWriter } from "../../services/signatures/key-signature-writer";
import { TempoWriter } from "../../services/signatures/tempo-writer";
import { TimeSignatureWriter } from "../../services/signatures/time-signature-writer";
import { textResult } from "../tool-response";
import { setKeySignatureSchema, setTempoSchema, setTimeSignatureSchema } from "./signatures.schema";

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

	server.registerTool(
		"set_time_signature",
		{
			description:
				"Sets a time signature change at the start of a measure, in all staves. Every measure from there up to the next time signature change must be empty (measure rests only; chord symbols are fine). Intended flow: insert_measures, set_time_signature, write_measures.",
			inputSchema: setTimeSignatureSchema,
		},
		async ({ file, measure, time }) => {
			const scoreFile = await ScoreFile.open(file);
			const score = scoreFile.read();

			new TimeSignatureWriter(scoreFile, score.staves).set(measure, time);

			await scoreFile.save();
			return textResult(`Set time signature ${time.beats}/${time.beatUnit} at measure ${measure} in ${file}`);
		},
	);

	server.registerTool(
		"set_tempo",
		{
			description: "Sets a tempo change at the start of a measure, on the first staff.",
			inputSchema: setTempoSchema,
		},
		async ({ file, measure, bpm }) => {
			const scoreFile = await ScoreFile.open(file);
			const score = scoreFile.read();

			new TempoWriter(scoreFile, score.staves).set(measure, bpm);

			await scoreFile.save();
			return textResult(`Set tempo ${bpm} bpm at measure ${measure} in ${file}`);
		},
	);
};
