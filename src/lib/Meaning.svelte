<script>
	/** @type {Concept} */
	export let concept
</script>

{#if concept.status === 'absent'}
	<span class="text-error">{concept.gloss}</span>
{:else}
	{concept.gloss}
{/if}
