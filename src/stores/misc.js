import { writable, derived } from "svelte/store";
import previous from "$stores/previous.js";

export const positions = writable([]);
export const scrollIndex = writable(0);
export const fontSize = writable(16);

const scrollIndexPrevious = previous(scrollIndex);

export const isForward = derived(
	[scrollIndex, scrollIndexPrevious],
	([cur, prev]) => cur >= prev
);
