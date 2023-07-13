import { csv, timeFormat } from "d3";
import { diffArrays } from "diff";

function splitWords(text) {
	const matches = text.match(/[\w'-]+|\s|[^a-zA-Z0-9\s]/g);
	if (matches) return matches.filter(Boolean);
	return [];
}

function getDiff(prev = "", cur = "") {
	const prevArr = splitWords(prev);
	const curArr = splitWords(cur);
	const diff = diffArrays(prevArr, curArr);

	const texts = diff.map((d) => {
		const group = d.value.join("");
		const state = d.added ? "add" : d.removed ? "remove" : "unchange";
		return d.value.map((text) => ({
			text,
			state,
			group
		}));
	});

	const flat = texts.flat().map((d, index) => ({
		index,
		...d
	}));
	return flat;
	// 	.join("**");
	// return diff;
}

// function cleanState(state) {
// 	if (state === "a") return "add";
// 	else if (state === "r") return "remove";
// 	else if (state === "u") return "unchange";
// }

// function parseTarget(diff) {
// 	return diff
// 		.filter((d) => d.state !== "remove")
// 		.map((d) => d.text)
// 		.join("");
// }

// function parseDiff(diff) {
// 	const chunks = diff.split("**");
// 	const cleaned = chunks.map((chunk) => {
// 		const [textString, stateAbbr] = chunk.split("~");
// 		const state = cleanState(stateAbbr);
// 		const group = textString.replace(/_/g, "");
// 		const texts = textString
// 			.split("_")
// 			.map((text) => text.replace(/\n/g, " NEWLINE "))
// 			.map((text) => ({ text, state, group }));
// 		return texts;
// 	});

// 	const flat = cleaned.flat();
// 	return flat;
// }

export default async function loadDiffData() {
	const raw = await csv("assets/test-edits-by-date.csv");
	const data = raw.map((d, i) => ({
		...d,
		dateFormatted: timeFormat("%b %d, %Y")(new Date(`${d.date}T12:00:00Z`)),
		diff: getDiff(raw[i - 1]?.content, d.content)
	}));

	// console.log(data);
	return data;
}
