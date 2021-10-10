<script lang="ts">
	import { schemable } from "$lib";
	let preference: string | null = null;
	let prefers: string;
</script>

<svelte:body
	use:schemable={{ preference }}
	on:preferscolorschemechange={({ detail }) => {
		// prefers = detail;
	}}
	on:colorschemechange={({ detail }) => {
		// preference = detail;
	}} />

<select bind:value={preference}>
	<option value={undefined}> not set </option>
	<option value="dark">dark</option>
	<option value="light">light</option>
</select>

prefers: {prefers}

<style>
	:global(.light) {
		background-color: #f7f7f7;
		color: #333;
	}
	:global(.dark) {
		background-color: #333;
		color: #f7f7f7;
	}
</style>
