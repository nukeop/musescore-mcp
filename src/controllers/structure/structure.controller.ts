import type { Controller } from "../../server";
import { ScoreFile } from "../../services/score-file";
import { BarlineWriter } from "../../services/structure/barline";
import { LayoutBreakWriter } from "../../services/structure/layout-break";
import { RehearsalMarkWriter } from "../../services/structure/rehearsal-mark";
import { TextWriter } from "../../services/structure/text";
import { VoltaWriter } from "../../services/structure/volta";
import { textResult } from "../tool-response";
import {
	addVoltaSchema,
	setBarlineSchema,
	setLayoutBreakSchema,
	setSectionMarkerSchema,
	setTextSchema,
} from "./structure.schema";

export const structureController: Controller = (server) => {
	server.registerTool(
		"set_section_marker",
		{
			description:
				"Sets a rehearsal mark with the given text at a measure, replacing any existing mark there.",
			inputSchema: setSectionMarkerSchema,
		},
		async ({ file, measure, text }) => {
			const scoreFile = await ScoreFile.open(file);
			const score = scoreFile.read();

			new RehearsalMarkWriter(scoreFile, score.staves).set(measure, text);

			await scoreFile.save();
			return textResult(`Set section marker "${text}" at measure ${measure} in ${file}`);
		},
	);

	server.registerTool(
		"set_barline",
		{
			description:
				"Sets the barline type at a measure: start-repeat, end-repeat (with an optional play count, default 2), double, or normal to clear any override.",
			inputSchema: setBarlineSchema,
		},
		async ({ file, measure, type, count }) => {
			if (count !== undefined && type !== "end-repeat") {
				throw new Error("Count is only valid with type end-repeat");
			}
			const scoreFile = await ScoreFile.open(file);
			const score = scoreFile.read();

			const writer = new BarlineWriter(scoreFile, score.staves);
			switch (type) {
				case "start-repeat":
					writer.startRepeat(measure);
					break;
				case "end-repeat":
					writer.endRepeat(measure, count);
					break;
				case "double":
					writer.double(measure);
					break;
				case "normal":
					writer.clear(measure);
					break;
			}

			await scoreFile.save();
			return textResult(`Set ${type} barline at measure ${measure} in ${file}`);
		},
	);

	server.registerTool(
		"add_volta",
		{
			description:
				"Adds a volta (ending bracket) over an inclusive measure range. The label and played ending derive from the ending number; the end hook defaults to closed for ending 1 and open otherwise.",
			inputSchema: addVoltaSchema,
		},
		async ({ file, from, to, ending, hook }) => {
			const scoreFile = await ScoreFile.open(file);
			const score = scoreFile.read();

			new VoltaWriter(scoreFile, score.staves).add({ from, to }, ending, hook);

			await scoreFile.save();
			return textResult(`Added volta ${ending} over measures ${from}-${to} in ${file}`);
		},
	);

	server.registerTool(
		"set_layout_break",
		{
			description:
				"Sets the layout break at a measure: system, page, or section, replacing any existing break there. Type none removes the break.",
			inputSchema: setLayoutBreakSchema,
		},
		async ({ file, measure, type }) => {
			const scoreFile = await ScoreFile.open(file);
			const score = scoreFile.read();

			const writer = new LayoutBreakWriter(scoreFile, score.staves);
			if (type === "none") {
				writer.clear(measure);
			} else {
				writer.set(measure, type);
			}

			await scoreFile.save();
			return textResult(`Set layout break ${type} at measure ${measure} in ${file}`);
		},
	);

	server.registerTool(
		"set_text",
		{
			description:
				"Sets a staff or system text at the start of a measure, replacing any existing text of the same style there.",
			inputSchema: setTextSchema,
		},
		async ({ file, measure, text, style, swing }) => {
			if (swing !== undefined && style !== "system") {
				throw new Error("Swing is only valid with style system");
			}
			const scoreFile = await ScoreFile.open(file);
			const score = scoreFile.read();

			new TextWriter(scoreFile, score.staves).set(measure, style, text, swing);

			await scoreFile.save();
			return textResult(`Set ${style} text "${text}" at measure ${measure} in ${file}`);
		},
	);
};
