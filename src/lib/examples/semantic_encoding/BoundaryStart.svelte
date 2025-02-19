<script>
	import Features from './Features.svelte'

	/** @type {SourceEntity} */
	export let source_entity

	function get_features_to_display() {
		// For Noun Phrases, show the Semantic Role. For everything else, show no codes
		if (source_entity.category === 'Noun Phrase') {
			return `${source_entity.category_abbr}-${source_entity.feature_codes[1]}`
		}
		return source_entity.category_abbr
	}
</script>

<span class="inline-flex pe-1 tracking-widest">
	<span class="text-lg font-thin">
		{source_entity.value}
	</span>
	<Features {source_entity} classes={'self-center'}>
		<span class="text-sm tracking-tight">
			{get_features_to_display()}
		</span>
	</Features>
</span>
