<script>
	/** @type {Concept} */
	export let concept
</script>

{#if concept.status === 'absent'}
	<span class="text-error text-lg font-bold">NOT IN THE ONTOLOGY</span>
	<span class="text-error">, but suggestions are available</span>
{:else}
	{concept.gloss}
{/if}
