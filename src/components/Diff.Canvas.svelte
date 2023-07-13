<script>
	import { browser } from "$app/environment";
	import { get } from "svelte/store";
	import { positions, fontSize } from "$stores/misc.js";
	import { tweened } from "svelte/motion";
	import { cubicInOut } from "svelte/easing";

	const duration = 1000;

	let canvasEl;
	let canvasWidth;
	let canvasHeight;
	let width;
	let height;
	let tweens;
	let animating = false;
	let steps;

	function getFill({ state, a }) {
		if (state === "add") return `rgba(50, 200, 50, ${a})`;
		if (state === "remove") return `rgba(200, 50, 50, ${a})`;
		return `rgba(0, 0, 0, ${a})`;
	}
	function render() {
		if (!animating) return;

		ctx.clearRect(0, 0, width, height);

		ctx.font = `${$fontSize * dpr}px sans-serif`;
		// console.log("render");
		tweens.forEach((t) => {
			const items = get(t);
			items.forEach((item) => {
				const { index, x, y, a, state, text, strike } = item;
				const match = $positions.find((p) => p.index === index);
				match.x = x;
				match.y = y;
				const left = x * dpr;
				const top = y * dpr + ($fontSize - 1) * dpr;

				// ctx.strokeStyle = "#fff"; // Set your stroke color
				// ctx.lineWidth = 2; // Set your line width for the stroke
				// ctx.strokeText(text, left, top);

				ctx.fillStyle = getFill({ state, a });
				ctx.fillText(text, left, top);

				// draw a strikethrough if removeing
				if (item.state === "remove") {
					if (!item.textW) item.textW = ctx.measureText(text).width;
					const strikeProgress = Math.min(1, strike * $fontSize);
					const strikeW = strikeProgress * item.textW;
					const offsetY = ($fontSize / 4) * dpr;
					ctx.strokeStyle = getFill({ state, a });
					ctx.lineWidth = 2;
					ctx.beginPath();
					ctx.moveTo(left, top - offsetY);

					// if (strikeProgress === 1) item.strikeDone = true;
					ctx.lineTo(left + strikeW, top - offsetY);
					ctx.stroke();
				}
				const w = ctx.measureText(text).width;
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

	function stepEnd(state) {
		steps.unshift();
		if (steps.length === 0) animating = false;
	}

	function update() {
		if (!ctx) return;

		animating = false;
		steps = ["remove", "unchange", "add"];

		tweens = steps.map((state, i) => {
			const filtered = $positions.filter((d) => d.state === state);
			const start = filtered.map((d) => ({
				...d,
				x: d.x,
				y: d.y,
				a: d.state === "add" ? 0 : d.state === "remove" ? 2 : 1,
				strike: 0
			}));

			const end = filtered.map((d) => ({
				...d,
				x: d.tx,
				y: d.ty,
				a: d.state === "remove" ? 0 : 1,
				strike: 1
			}));

			const tween = tweened(start, {
				duration: duration,
				delay: i * duration,
				easing: cubicInOut
			});
			tween.set(end).then(() => stepEnd(state));
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
		pointer-events: none;
		/* display: none; */
	}
</style>
