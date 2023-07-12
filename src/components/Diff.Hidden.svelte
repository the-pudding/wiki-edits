<script>
	import { onMount, afterUpdate } from "svelte";
	import { positions } from "$stores/misc.js";
	import previous from "$stores/previous.js";

	export let diff = [];

	const positionsPrev = previous(positions);

	function indexWords() {
		// TODO: diffing is not correct (look at "launched" in March)
		const words = diff
			.map(({ text, state }) => {
				if (state === "remove") return;
				// const clean = text.replace(
				// 	"<span class='newline'></span>",
				// 	"[newline]"
				// );
				const group = text;
				const split = text
					.split(/([\s.,;:!?()]+)/)
					.map((word) => ({ word, state, group }));
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
		const spans = document.querySelectorAll("span[data-state]");
		const positionsNew = Array.from(spans)
			.filter((span) => span.innerHTML !== " ")
			.map((span) => {
				const { top, left } = span.getBoundingClientRect();
				const id = span.dataset.id;
				const text = span.innerHTML;
				const tx = left;
				const ty = top;
				const state = span.dataset.state;
				const group = span.dataset.group;
				return { id, tx, ty, text, state, group };
			});

		// console.table(positionsNew);
		// go through ALL positionsNew, and find if there are matches for UNCHANGE in $positions (previous)
		const update = positionsNew
			.filter((d) => d.state === "unchange")
			.map((d) => {
				const match = $positions.find((p) => !p.matched && p.text === d.text);
				if (match) {
					match.matched = true;
					// this will retain the previous x/y position
					return { ...match, ...d };
				} else {
					console.log("this should not be possible");
				}
			});
		// console.log(update);
		// console.log("UPDATE");
		// console.table($positions);
		// if there are, join the data, and set a flag for keeping it, everything else is targeted for removal
		const remove = $positions
			.filter((d) => !d.matched && d.state !== "remove")
			.map((d) => ({
				...d,
				state: "remove",
				x: d.x,
				y: d.y,
				tx: d.x,
				ty: d.y
			}));

		const add = positionsNew
			.filter((d) => d.state === "add")
			.map((d) => ({
				...d,
				x: d.tx,
				y: d.ty
			}));

		const modified = [...update, ...remove, ...add];
		modified.forEach((m) => delete m.matched);
		console.table(modified);
		// console.log("MODIFIED");
		// console.log(update, remove, add);
		$positions = [...modified];

		// const modified = $positions
		// 	.filter((d) => d.state !== "remove")
		// 	.map((prev) => {
		// 		const cur = positionsNew.find((d) => d.id === prev.id);
		// 		const state = cur ? "unchange" : "remove";

		// 		if (cur) cur.state = state;

		// 		return {
		// 			...prev,
		// 			...cur,
		// 			state
		// 		};
		// 	});

		// positionsNew
		// 	.filter((d) => d.state === "add")
		// 	.forEach((d) => {
		// 		d.x = d.tx;
		// 		d.y = d.ty;
		// 		modified.push(d);
		// 	});

		// $positions = [...modified];
	}

	// function setSpanPositions() {
	// 	const spans = document.querySelectorAll("span[data-state]");
	// 	const positionsNew = Array.from(spans)
	// 		.filter((span) => span.innerHTML !== " ")
	// 		.map((span) => {
	// 			const { top, left } = span.getBoundingClientRect();
	// 			const id = span.dataset.id;
	// 			const text = span.innerHTML;
	// 			const tx = left;
	// 			const ty = top;
	// 			const state = span.dataset.state;
	// 			const group = span.dataset.group;
	// 			return { id, tx, ty, text, state, group };
	// 		});

	// 	// console.table(positionsNew);
	// 	// prev = ["this-0", "is-0", "a-0", "test-0"]
	// 	// new = ["this-0", "thing-0", "is-0", "cool-0"]
	// 	const modified = $positions
	// 		.filter((d) => d.state !== "remove")
	// 		.map((prev) => {
	// 			const cur = positionsNew.find((d) => d.id === prev.id);
	// 			const state = cur ? "unchange" : "remove";

	// 			if (cur) cur.state = state;

	// 			return {
	// 				...prev,
	// 				...cur,
	// 				state
	// 			};
	// 		});

	// 	positionsNew
	// 		.filter((d) => d.state === "add")
	// 		.forEach((d) => {
	// 			d.x = d.tx;
	// 			d.y = d.ty;
	// 			modified.push(d);
	// 		});

	// 	$positions = [...modified];
	// }

	afterUpdate(async () => {
		setSpanPositions();
	});

	onMount(() => {});

	$: words = indexWords(diff);
</script>

<div class="hidden">
	{#each words as { word, state, group, id }}
		{@const add = state === "add"}
		{@const remove = state === "remove"}
		{@const unchange = state === "unchange"}
		{#if word === "NEWLINE"}
			<span class="newline" />
		{:else}
			<span
				class:add
				class:remove
				class:unchange
				data-id={id}
				data-group={group}
				data-state={state}>{@html word}</span
			>
		{/if}
	{/each}
</div>

<style>
	.hidden {
		width: 100%;
		visibility: hidden;
		/* pointer-events: none; */
	}

	.newline {
		display: block;
		height: 16px;
	}

	[data-id] {
		color: gray;
	}

	.add {
		color: green;
	}

	.remove {
		color: red;
	}
</style>
