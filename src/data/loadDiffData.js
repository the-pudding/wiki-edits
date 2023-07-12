import { ascending, csv, timeFormat } from "d3";

function cleanState(state) {
	if (state === "a") return "add";
	else if (state === "r") return "remove";
	else if (state === "u") return "unchange";
}

function parseTarget(diff) {
	const chunks = diff.split("++");
	return chunks
		.map((chunk) => {
			const datum = chunk.split("||");
			const text = datum[0];
			const state = cleanState(datum[1]);
			if (state !== "remove") return text;
		})
		.join("");
}

function parseDiff(diff) {
	const chunks = diff.split("++");
	return chunks.map((chunk) => {
		const datum = chunk.split("||");
		const text = datum[0].replace(/\n/g, " NEWLINE ");
		const state = cleanState(datum[1]);
		const count = +datum[2];
		return { text, state, count };
	});
}

export default async function loadDiffData() {
	const raw = await csv("assets/test-diff-by-date.csv");
	const data = raw.map((d) => ({
		...d,
		dateFormatted: timeFormat("%b %d, %Y")(new Date(`${d.date}T12:00:00Z`)),
		diff: parseDiff(d.diff),
		target: parseTarget(d.diff),
		edits: +d.edits
	}));

	data.sort((a, b) => ascending(a.date, b.date));
	return data;
}
