<script>
	export let diff = [];

	$: chunks = diff;
</script>

<figure>
	<p>
		{#each chunks as { text, cat, count }}
			{@const added = cat === "added"}
			{@const removed = cat === "removed"}
			{@const unchanged = cat === "unchanged"}
			<span data-edit class:added class:removed class:unchanged
				>{@html text}</span
			>
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

	.added {
		background: lightgreen;
	}

	.removed {
		background: pink;
	}
</style>
