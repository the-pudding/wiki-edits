<script>
	import { browser } from "$app/environment";
	import { getContext } from "svelte";
	import WIP from "$components/helpers/WIP.svelte";
	import Scrolly from "$components/helpers/Scrolly.svelte";
	import Figure from "$components/figure/Figure.svelte";
	import Diff from "$components/Diff.svelte";
	import loadDiffData from "$data/loadDiffData.js";

	// const copy = getContext("copy");
	// const data = getContext("data");
	let data = [];
	let scrollIndex;

	async function load() {
		data = await loadDiffData();
	}

	$: if (browser) load();
	$: diff = data[scrollIndex || 0]?.diff;
</script>

<!-- <WIP /> -->

{#if data.length}
	<section id="steps">
		<Scrolly bind:value={scrollIndex}>
			{#each data as { dateFormatted, diffs, revid }, i}
				{@const active = scrollIndex === i}
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

	<section id="graphic">
		<Diff {diff} />
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
		height: 20vh;
		display: flex;
		align-items: center;
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
</style>
