<script>
	/** @type {Concept['categories']} */
	export let categories

	$: [semantic_category, ...usages] = categories
	$: always_usages = usages.filter(usage => usage.startsWith('always'))
	$: sometimes_usages = usages.filter(usage => usage.startsWith('sometimes'))
	$: grouped_usages = [...always_usages, ...sometimes_usages]
</script>

<fieldset class="prose rounded-lg border p-4">
	<legend class="rounded-lg bg-base-200 px-2 text-lg font-bold tracking-widest">
		{semantic_category || 'None'}
	</legend>

	{#if grouped_usages.length}
		<dl class="mt-0">
			{#if always_usages.length}
				<dt>Always...</dt>

				{#each always_usages as usage}
					<dd>{usage.replace('always ', '')}</dd>
				{/each}
			{/if}

			{#if sometimes_usages.length}
				<dt>Sometimes...</dt>

				{#each sometimes_usages as usage}
					<dd>{usage.replace('sometimes ', '')}</dd>
				{/each}
			{/if}
		</dl>
	{:else}
		<p class="mt-0 italic">No usage information available.</p>
	{/if}
</fieldset>

<style lang="postcss">
	dt {
		@apply mt-0 italic;
	}
</style>
