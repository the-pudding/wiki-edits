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
}

export default async function loadDiffData() {
	const raw = await csv("assets/edits-by-date.csv");
	const cleanContent = raw.map((d) => ({
		...d,
		content: d.content
			.replace(/\n/g, " NEWLINE ")
			.replace("–", "-")
			.replace("—", "-")
	}));
	const data = cleanContent.map((d, i) => ({
		...d,
		dateFormatted: timeFormat("%b %d, %Y")(new Date(`${d.date}T12:00:00Z`)),
		diff: getDiff(cleanContent[i - 1]?.content, d.content)
	}));

	// console.log(data);
	return data;
}
