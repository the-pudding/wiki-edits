import { derived } from "svelte/store";

export default function previous(store) {
	let p = null;

	return derived(store, (current) => {
		const prev = p;
		p = current;
		return prev;
	});
}
