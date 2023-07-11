<script>
	import { browser } from "$app/environment";
	import { get } from "svelte/store";
	import { scrollIndex, positions } from "$stores/misc.js";
	import { tweened } from "svelte/motion";
	import { cubicInOut } from "svelte/easing";

	let canvasEl;
	let canvasWidth;
	let canvasHeight;
	let width;
	let height;
	let tweens;
	let animating = false;
	let steps;

	function getFill({ action, a }) {
		if (action === "enter") return `rgba(50, 200, 50, ${a})`;
		if (action === "exit") return `rgba(200, 50, 50, ${a})`;
		return `rgba(0, 0, 0, ${a})`;
	}
	function render() {
		if (!animating) return;

		ctx.clearRect(0, 0, width, height);

		ctx.font = `${16 * dpr}px sans-serif`;
		// console.log("render");
		tweens.forEach((t) => {
			const items = get(t);
			items.forEach(({ id, x, y, a, action, text }) => {
				const match = $positions.find((p) => p.id === id);
				match.x = x;
				match.y = y;
				const left = x * dpr;
				const top = y * dpr + (16 - 1) * dpr;

				ctx.fillStyle = getFill({ action, a });
				ctx.fillText(text, left, top);
			});
		});

		requestAnimationFrame(render);
		// render a square in the middle of screen canvas
		// ctx.fillStyle = "black";
		// ctx.fillRect(200, 200, 200, 200);
	}

	function resize() {
		width = dpr * canvasWidth;
		height = dpr * canvasHeight;
	}

	function stepEnd(action) {
		steps.unshift();
		if (steps.length === 0) animating = false;
	}

	function update() {
		if (!ctx) return;

		animating = false;
		steps = ["exit", "update", "enter"];

		tweens = steps.map((action, i) => {
			const filtered = $positions.filter((d) => d.action === action);
			const start = filtered.map((d) => ({
				...d,
				x: d.x,
				y: d.y + (d.action === "enter" ? 17 * dpr : 0),
				a: d.action === "enter" ? 0 : 1
			}));

			const end = filtered.map((d) => ({
				...d,
				x: d.tx,
				y: d.ty - (d.action === "exit" ? 17 * dpr : 0),
				a: d.action === "exit" ? 0 : 1
			}));

			const tween = tweened(start, {
				duration: 500,
				delay: i * 500,
				easing: cubicInOut
			});
			tween.set(end).then(() => stepEnd(action));
			return tween;
		});

		animating = true;
		render();
	}

	$: dpr = browser ? Math.min(2, window.devicePixelRatio || 1) : 1;
	$: ctx = canvasEl?.getContext("2d");
	$: if (ctx && dpr) resize();
	$: update($positions);
	// $: if (tweener && $tweener.length) console.log($tweener[0]);
	// $: console.log({ animating });
	// $: if (tweener && $tweener.length) render($tweener);
	// $: if (ctx && dpr) render($positions);
	// $: console.log($positions);
</script>

<canvas
	bind:this={canvasEl}
	{width}
	{height}
	bind:clientWidth={canvasWidth}
	bind:clientHeight={canvasHeight}
/>

<style>
	canvas {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		/* display: none; */
	}

	span {
		position: absolute;
	}
</style>
