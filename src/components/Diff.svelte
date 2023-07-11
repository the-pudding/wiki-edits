<script>
	import { tick } from "svelte";
	import { browser } from "$app/environment";
	import { flip } from "svelte/animate";
	import { fly } from "svelte/transition";
	import { cubicInOut } from "svelte/easing";
	import {
		customFlip,
		customFlyIn,
		customFlyOut
	} from "$utils/better-animation.js";

	import { gsap } from "gsap/dist/gsap";
	import { Flip } from "gsap/dist/Flip";

	export let diff = [];

	async function animate() {
		const targets = gsap.utils.toArray("[data-word]");

		const state = Flip.getState(targets);

		await tick();

		const options = {
			targets: ["[data-word]"],
			duration: 10,
			prune: true,
			simple: true,
			onEnter: (elements) => {
				console.log("enter", elements.length);
				return gsap.fromTo(
					elements,
					{ opacity: 0 },
					{ opacity: 1, delay: 1, duration: 10 }
				);
			},
			onLeave: (elements) => {
				console.log("leave", elements.length);
				return gsap.fromTo(
					elements,
					{ opacity: 1 },
					{ opacity: 0, delay: 1, duration: 10 }
				);
			}
		};

		Flip.from(state, options);
	}

	function indexWords() {
		const words = diff
			.map(({ text, cat }) => {
				if (cat === "removed") return;
				// const clean = text.replace(
				// 	"<span class='newline'></span>",
				// 	"[newline]"
				// );
				const split = text.split(/([\s.,;:!?]+)/).map((word) => word);
				return split;
			})
			.flat()
			.filter(Boolean)
			.filter((d) => d !== " ");

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

	$: if (browser) gsap.registerPlugin(Flip);
	$: words = indexWords(diff);
	$: animate(diff);
</script>

<figure>
	<!-- animate:flip={{ delay: 250, duration: 4000, easing: cubicInOut }}
		in:fly={{ delay: 900, y: 24, duration: 500 }}
				
				-->
	<p>
		{#each words as { word, id } (id)}
			{@const text = word.replace(" ", "&nbsp;")}
			<span data-word>{@html text}</span>
		{/each}
	</p>
</figure>

<style>
	figure {
		margin: 0;
		padding: 8px;
		position: fixed;
		top: 0;
		left: 0;
		/* pointer-events: none; */
	}

	p {
		font-size: 16px;
		line-height: 1.6;
		margin: 0;
	}

	span {
		display: inline-block;
	}

	.added {
		background: lightgreen;
	}

	.removed {
		background: pink;
	}
</style>
