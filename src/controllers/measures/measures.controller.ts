import { NotationParser } from "../../notation/parser";
import type { Controller } from "../../server";
import { MeasureStructureWriter } from "../../services/measure-structure-writer";
import { ScoreFile } from "../../services/score-file";
import { StaffWriter } from "../../services/staff-writer";
import { textResult } from "../tool-response";
import {
	deleteMeasuresSchema,
	insertMeasuresSchema,
	readMeasuresSchema,
	writeMeasuresSchema,
} from "./measures.schema";
import { MeasuresRenderer } from "./measures-renderer";

export const measuresController: Controller = (server) => {
	server.registerTool(
		"read_measures",
		{
			description:
				"Returns the bar notation for a range of measures: notes as written pitch, rests, durations with dots, separated by |.",
			inputSchema: readMeasuresSchema,
		},
		async ({ file, from, to, staff }) => {
			const scoreFile = await ScoreFile.open(file);
			const scoreStaff = scoreFile.readStaff(staff ?? 1);

			if (to > scoreStaff.measures.length) {
				throw new Error(
					`Measure range ${from}-${to} exceeds score length (${scoreStaff.measures.length} measures): ${file}`,
				);
			}

			const voices = scoreStaff.measures.slice(from - 1, to).map((measure) => measure.voices[0]);

			return textResult(new MeasuresRenderer(voices, scoreStaff.part).render());
		},
	);

	server.registerTool(
		"write_measures",
		{
			description:
				"Replaces the content of consecutive bars with the given notation. Bar separators define the bar count. Each bar must fill the time signature exactly.",
			inputSchema: writeMeasuresSchema,
		},
		async ({ file, from, content, staff }) => {
			const scoreFile = await ScoreFile.open(file);
			const scoreStaff = scoreFile.readStaff(staff ?? 1);
			const bars = new NotationParser(content, scoreStaff.part).parse();

			new StaffWriter(scoreFile, scoreStaff).write(from, bars);

			await scoreFile.save();
			return textResult(`Wrote measures ${from}-${from - 1 + bars.length} to ${file}`);
		},
	);

	server.registerTool(
		"insert_measures",
		{
			description: "Inserts empty bars before a measure. Time and key signature at bar 1 stay at bar 1.",
			inputSchema: insertMeasuresSchema,
		},
		async ({ file, at, count }) => {
			const scoreFile = await ScoreFile.open(file);
			const score = scoreFile.read();

			new MeasureStructureWriter(scoreFile, score.staves).insert(at, count);

			await scoreFile.save();
			return textResult(`Inserted measures ${at}-${at + count - 1} in ${file}`);
		},
	);

	server.registerTool(
		"delete_measures",
		{
			description: "Deletes a range of bars.",
			inputSchema: deleteMeasuresSchema,
		},
		async ({ file, from, to }) => {
			const scoreFile = await ScoreFile.open(file);
			const score = scoreFile.read();

			new MeasureStructureWriter(scoreFile, score.staves).delete(from, to);

			await scoreFile.save();
			return textResult(`Deleted measures ${from}-${to} from ${file}`);
		},
	);
};
