import { get, readable, writable, derived } from "svelte/store";
import { browser } from "$app/environment";
import previous from "$stores/previous.js";
import viewport from "$stores/viewport.js";
import loadDiffData from "$data/loadDiffData.js";

const data = writable([]);
export const positions = writable([]);
export const diffIndex = writable(0);
export const fontSize = writable(16);
export const canvasHeight = writable(0);

const diffIndexPrevious = previous(diffIndex);

export const isForward = derived(
	[diffIndex, diffIndexPrevious],
	([cur, prev]) => cur >= prev
);

export const isJump = derived(
	[diffIndex, diffIndexPrevious],
	([cur, prev]) => cur - prev > 1
);

export const diffData = derived([data, diffIndex], ([$data, $diffIndex]) => {
	return $data[$diffIndex]?.diff || [];
});

export const numDiffs = derived(data, ($data) => $data.length - 1);

async function load() {
	const raw = await loadDiffData();
	data.set(raw);

	const { width, height } = get(viewport);

	const heightFactor = height > 800 ? Math.min(1.25, height / 600) : 1;
	const fs = Math.floor(width * 0.015 * heightFactor);

	canvasHeight.set(`${height}px`);
	fontSize.set(fs);
}

if (browser) load();
