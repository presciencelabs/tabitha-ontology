<script lang="ts">
	import SemanticCategorization from './SemanticCategorization.svelte'
	import UsageInfo from './UsageInfo.svelte'

	interface Props {
		categories?: string[]
	}

	let { categories = $bindable([]) }: Props = $props()
</script>

<SemanticCategorization part_of_speech="Adjective" bind:categories={categories} />
<UsageInfo part_of_speech="Adjective" bind:categories={categories} offset={1} />
