<script>
	import { afterUpdate } from "svelte";
	import { positions, fontSize, isForward } from "$stores/misc.js";

	export let diff = [];

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

	function jump() {
		const unchange = textNoSpaces.map((d) => ({
			...d,
			x: d.tx,
			y: d.ty,
			state: "unchange"
		}));

		$positions = [...unchange];
	}

	function join() {
		// go through ALL textNoSpaces, and find if there are matches for UNCHANGE or REMOVE in $positions (previous)
		const unchange = textNoSpaces
			.filter((d) => d.state === "unchange")
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
		// console.table($positions);
		modified.forEach((m) => delete m.matched);

		$positions = [...modified];
	}
	function setSpanPositions() {
		// console.table(textNoSpaces);
		const spans = document.querySelectorAll("span[data-index]");
		const spansNoSpaces = Array.from(spans).filter(
			(span) => span.innerHTML !== " "
		);

		// add new target position to all textNoSpaces (target text)
		spansNoSpaces.forEach((span, i) => {
			const { top, left } = span.getBoundingClientRect();
			const index = +span.dataset.index;
			const match = textNoSpaces.find((d) => d.index === index);
			match.tx = left;
			match.ty = top;
		});

		if ($isForward) join();
		else jump();
	}

	$: render = diff.filter((d) => d.state !== "remove");
	$: console.log({ forward: $isForward });

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
				style:font-size={$fontSize}
				class:add
				class:remove
				class:unchange
				data-index={index}>{@html text}</span
			>
		{/if}
	{/each}
</div>

<style>
	.hidden {
		width: 100%;
		visibility: hidden;
		pointer-events: none;
	}

	.newline {
		display: block;
		height: 16px;
	}

	[data-text] {
		color: gray;
		white-space: nowrap;
	}

	.add {
		color: green;
	}

	.remove {
		color: red;
	}
</style>
