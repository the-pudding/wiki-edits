<script>
	import { afterUpdate } from "svelte";
	import { positions } from "$stores/misc.js";
	import previous from "$stores/previous.js";

	export let diff = [];

	const positionsPrev = previous(positions);

	function indexWords() {
		// TODO not using id anymore
		// TODO: diffing is not correct (look at "launched" in March)
		const words = diff
			.map(({ text, state }) => {
				if (state === "remove") return;
				// const clean = text.replace(
				// 	"<span class='newline'></span>",
				// 	"[newline]"
				// );
				const split = text
					.split(/(\W(?<!-))/)
					.filter(Boolean)
					.map((word) => ({ word, state }));
				return split;
			})
			.flat()
			.filter((d) => d?.word);

		// a unique id that is a combo of the word and its occurence number
		const dict = new Map();
		const withId = words.map(({ word, state }) => {
			const count = dict.get(word) || 0;
			dict.set(word, count + 1);
			const id = `${word}-${count}`;
			return {
				word,
				state,
				id
			};
		});

		return withId;
	}

	function setSpanPositions() {
		const spans = document.querySelectorAll("span[data-text]");
		const spansNoSpaces = Array.from(spans).filter(
			(span) => span.innerHTML !== " "
		);

		spansNoSpaces.forEach((span, i) => {
			const { top, left } = span.getBoundingClientRect();
			const index = +span.dataset.index;
			const match = textNoSpaces.find((d) => d.index === index);
			match.tx = left;
			match.ty = top;
			// const id = span.dataset.id;
			// const text = span.innerHTML;
			// const tx = left;
			// const ty = top;
			// const state = span.dataset.state;
			// return { id, tx, ty, text, state };
		});

		// console.table(textNoSpaces);

		// go through ALL textNoSpaces, and find if there are matches for UNCHANGE or REMOVE in $positions (previous)
		const unchange = textNoSpaces
			.filter((d) => d.state === "unchange")
			.map((d) => {
				const match = $positions.find((p) => !p.matched && p.text === d.text);
				if (match) {
					match.matched = true;
					// this will retain the previous x/y position
					return { ...match, ...d };
				} else {
					console.log(d);
					console.log("this should not be possible");
				}
			});

		// console.log("UNCHANGE");
		// console.table(unchange);

		const remove = textNoSpaces
			.filter((d) => d.state === "remove")
			.map((d) => {
				const match = $positions
					.filter((d) => d.state !== "remove")
					.find((p) => !p.matched && p.text === d.text);
				if (match) {
					match.matched = true;
					// this will retain the previous x/y position
					return { ...match, ...d };
				} else {
					console.log(d);
					console.log("this should not be possible");
				}
			});

		// console.log("REMOVE");
		// console.table(remove);

		const add = textNoSpaces
			.filter((d) => d.state === "add")
			.map((d) => ({
				...d,
				x: d.tx,
				y: d.ty
			}));

		// console.log("ADD");
		// console.table(add);

		const modified = [...unchange, ...remove, ...add];
		modified.forEach((m) => delete m.matched);

		$positions = [...modified];
	}

	$: render = diff.filter((d) => d.state !== "remove");

	$: textNoSpaces = diff
		.filter((d) => d.text !== " " && d.text !== "NEWLINE")
		.map((d) => ({ ...d }));

	afterUpdate(async () => {
		setSpanPositions();
	});
</script>

<div class="hidden">
	{#each render as { index, text, state, group }}
		{@const add = state === "add"}
		{@const remove = state === "remove"}
		{@const unchange = state === "unchange"}
		{#if text === "NEWLINE"}
			<span class="newline" />
		{:else}
			<span
				class:add
				class:remove
				class:unchange
				data-index={index}
				data-text={text}
				data-state={state}>{@html text}</span
			>
		{/if}
	{/each}
</div>

<style>
	.hidden {
		width: 100%;
		/* visibility: hidden; */
		/* pointer-events: none; */
	}

	.newline {
		display: block;
		height: 16px;
	}

	[data-text] {
		color: gray;
		font-size: 18px;
	}

	.add {
		color: green;
	}

	.remove {
		color: red;
	}
</style>
