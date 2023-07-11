import { flip } from "svelte/animate";
import { fly } from "svelte/transition";

/**
 * We are resetting the styles if animation already exists
 * Be aware that all default styles will be overriden that way
 */
export function customFlip(node, fromTo, params = {}) {
	if (node.style.animation) node.style = null;
	node.classList.remove("added", "removed");
	return flip(node, fromTo, { ...params });
}

/**
 * If the element is still animating,
 * reset everything and start again
 */
export function customFlyIn(node, params = {}) {
	if (node.style.animation) node.style = null;
	node.classList.add("added");
	return fly(node, { ...params });
}

/**
 * If the element was already flying out, leave it that way.
 * Do not add another flying animation, as the new element is going
 * to
 */
export function customFlyOut(node, params = {}) {
	if (node.style.animation) return;
	node.classList.add("removed");
	return fly(node, { ...params });
}
