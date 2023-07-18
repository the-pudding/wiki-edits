<script>
	import { browser } from "$app/environment";
	import { onMount, getContext } from "svelte";

	import {
		diffIndex,
		diffData,
		numDiffs,
		fontSize,
		positions,
		canvasHeight
	} from "$stores/misc.js";
	import WIP from "$components/helpers/WIP.svelte";
	import Scrolly from "$components/helpers/Scrolly.svelte";
	import Range from "$components/helpers/Range.svelte";
	import Figure from "$components/figure/Figure.svelte";
	import DiffHidden from "$components/Diff.Hidden.svelte";
	import DiffCanvas from "$components/Diff.Canvas.svelte";

	// const copy = getContext("copy");
	// const data = getContext("data");
	let diffValue;

	$: $diffIndex = diffValue || 0;
</script>

<!-- <WIP /> -->

{#if $diffData.length}
	<section id="slider">
		<Range bind:value={diffValue} min={0} max={$numDiffs} />
	</section>
	<section id="steps">
		<!-- <Scrolly bind:value={diffValue}>
			{#each data as { dateFormatted, diffs, revid }, i}
				{@const active = $diffIndex === i}
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
		</Scrolly> -->
	</section>

	<section id="graphic" style:height={$canvasHeight}>
		<DiffHidden />
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

	#slider {
		padding: 32px;
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
		pointer-events: none;
	}
</style>
