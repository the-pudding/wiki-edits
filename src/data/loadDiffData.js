import { ascending, csv, timeFormat } from "d3";

function cleanCat(cat) {
	if (cat === "a") return "added";
	else if (cat === "r") return "removed";
	else if (cat === "u") return "unchanged";
}

function parseDiff(diff) {
	const chunks = diff.split("++");
	return chunks.map((chunk) => {
		const datum = chunk.split("||");
		const text = datum[0].replace(/\n/g, "<span class='newline'></span>");
		const cat = cleanCat(datum[1]);
		const count = +datum[2];
		return { text, cat, count };
	});
}

export default async function loadDiffData() {
	const raw = await csv("assets/diff-by-date.csv");
	const data = raw.map((d) => ({
		...d,
		dateFormatted: timeFormat("%b %d, %Y")(new Date(`${d.date}T12:00:00Z`)),
		diff: parseDiff(d.diff),
		edits: +d.edits
	}));

	data.sort((a, b) => ascending(a.date, b.date));
	return data;
}
