<script>
	import { onMount, afterUpdate } from "svelte";
	import { positions } from "$stores/misc.js";
	import previous from "$stores/previous.js";

	export let diff = [];

	const positionsPrev = previous(positions);

	function indexWords() {
		const words = diff
			.map(({ text, cat }) => {
				if (cat === "exit") return;
				// const clean = text.replace(
				// 	"<span class='newline'></span>",
				// 	"[newline]"
				// );
				const split = text.split(/([\s.,;:!?]+)/).map((word) => word);
				return split;
			})
			.flat()
			.filter(Boolean);

		// a unique id that is a combo of the word and its occurence number
		const dict = new Map();
		const withId = words.map((word) => {
			const count = dict.get(word) || 0;
			dict.set(word, count + 1);
			const id = `${word}-${count}`;
			return {
				word,
				id
			};
		});

		return withId;
	}

	function setSpanPositions() {
		const spans = document.querySelectorAll("span[data-id]");
		const positionsNew = Array.from(spans)
			.filter((span) => span.innerHTML !== " ")
			.map((span) => {
				const { top, left } = span.getBoundingClientRect();
				const id = span.dataset.id;
				const text = span.innerHTML;
				const tx = left;
				const ty = top;
				return { id, tx, ty, text };
			});

		// prev = ["this-0", "is-0", "a-0", "test-0"]
		// new = ["this-0", "thing-0", "is-0", "cool-0"]
		const modified = $positions
			.filter((d) => d.action !== "exit")
			.map((prev) => {
				const cur = positionsNew.find((d) => d.id === prev.id);
				const action = cur ? "update" : "exit";

				if (prev.id === "is-0") console.log(cur.x, prev.x);
				// TODO target position for exit?
				if (cur) cur.action = action;

				return {
					...prev,
					...cur,
					action
				};
			});

		positionsNew
			.filter((d) => !d.action)
			.forEach((d) => {
				d.action = "enter";
				d.x = d.tx;
				d.y = d.ty;
				modified.push(d);
			});

		$positions = [...modified];
		// console.table($positions);
	}

	afterUpdate(async () => {
		setSpanPositions();
	});

	onMount(() => {});

	$: words = indexWords(diff);
	$: console.log(words);
</script>

<div class="hidden">
	{#each words as { word, id }}
		{#if word === "NEWLINE"}
			<span class="newline" />
		{:else}
			<span data-id={id}>{@html word}</span>
		{/if}
	{/each}
</div>

<style>
	.hidden {
		position: absolute;
		width: 100%;
		visibility: hidden;
		pointer-events: none;
	}

	.newline {
		display: block;
		height: 16px;
	}
</style>
