import { ascending, csv, timeFormat } from "d3";

function cleanCat(cat) {
	if (cat === "a") return "enter";
	else if (cat === "r") return "exit";
	else if (cat === "u") return "update";
}

function parseDiff(diff) {
	const chunks = diff.split("++");
	return chunks.map((chunk) => {
		const datum = chunk.split("||");
		const text = datum[0].replace(/\n/g, "NEWLINE");
		// const text = datum[0].replace(/\n/g, "<span class='newline'></span>");
		// const text = datum[0];
		const cat = cleanCat(datum[1]);
		const count = +datum[2];
		return { text, cat, count };
	});
}

export default async function loadDiffData() {
	const raw = await csv("assets/diff-by-date.csv");
	// const raw = await csv("assets/test.csv");
	const data = raw.map((d) => ({
		...d,
		dateFormatted: timeFormat("%b %d, %Y")(new Date(`${d.date}T12:00:00Z`)),
		diff: parseDiff(d.diff),
		edits: +d.edits
	}));

	data.sort((a, b) => ascending(a.date, b.date));
	return data;
}
