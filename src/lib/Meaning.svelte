<script>
	/** @type {Concept} */
	export let concept
</script>

<p>
	{#if concept.status === 'absent'}
		<span class="text-error">{concept.gloss}</span>
	{:else}
		{concept.gloss}
	{/if}
</p>
