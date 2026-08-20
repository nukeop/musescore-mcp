import { describe, test } from "bun:test";

describe("write_measures", () => {
	test.todo("writes notes, rests and dotted durations");
	test.todo("writes sounding pitch and both tonal pitch classes for a transposing staff");
	test.todo("rejects a bar that overflows the time signature, naming the bar and the beat");
	test.todo("rejects a bar that does not fill the time signature, naming the missing duration");
	test.todo("doesn't modify bars outside the written range");
	test.todo("errors for a file that does not exist");
});
