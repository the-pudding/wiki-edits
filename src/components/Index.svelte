<script>
	import { browser } from "$app/environment";
	import { onMount, getContext } from "svelte";
	import viewport from "$stores/viewport.js";
	import { scrollIndex, fontSize, positions } from "$stores/misc.js";
	import WIP from "$components/helpers/WIP.svelte";
	import Scrolly from "$components/helpers/Scrolly.svelte";
	import Figure from "$components/figure/Figure.svelte";
	import DiffHidden from "$components/Diff.Hidden.svelte";
	import DiffCanvas from "$components/Diff.Canvas.svelte";
	import loadDiffData from "$data/loadDiffData.js";

	// const copy = getContext("copy");
	// const data = getContext("data");
	let height;
	let data = [];
	let scrollValue;

	async function load() {
		data = await loadDiffData();
	}

	$: $scrollIndex = scrollValue || 0;
	$: diff = data[$scrollIndex]?.diff;
	onMount(() => {
		height = `${$viewport.height}px`;

		const heightFactor = height > 800 ? Math.min(1.25, height / 600) : 1;
		const fs = $viewport.width * 0.015 * heightFactor;
		$fontSize = fs;
		load();
	});
</script>

<!-- <WIP /> -->

{#if data.length}
	<section id="steps">
		<Scrolly bind:value={scrollValue}>
			{#each data as { dateFormatted, diffs, revid }, i}
				{@const active = $scrollIndex === i}
				<div data-revid={revid} class:active>
					<p>
						{dateFormatted}
						<a
							href="https://en.wikipedia.org/w/index.php?title=Russian_invasion_of_Ukraine&oldid={revid}"
							target="_blank"
							rel="noreferrer">W</a
						>
					</p>
				</div>
			{/each}
		</Scrolly>
	</section>

	<section id="graphic" style:height>
		<DiffHidden {diff} />
		<DiffCanvas />
	</section>
{/if}

<!-- <Footer /> -->

<style>
	#steps {
		margin-bottom: 99vh;
		margin-top: 100vh;
		position: relative;
		z-index: var(--z-overlay);
		pointer-events: none;
	}

	[data-revid] {
		height: 50vh;
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}

	p {
		margin: 0;
		background: white;
		font-size: var(--14px);
		padding: 8px;
	}

	.active {
		font-weight: bold;
	}

	#graphic {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		padding: 16px;
	}
</style>
