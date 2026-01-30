<script lang="ts">
	import Icon from '@iconify/svelte'
	import type { PageProps } from './$types'
	import { ConceptKey } from '$lib'

	let { data, form }: PageProps = $props()

	let concept_data = $state(data.concept_data)
	let initial_data = $state($state.snapshot(concept_data))
	let is_dirty = $derived(!deep_equal(concept_data, initial_data))

	const levels = ['0','1','2','3','4']

	function deep_equal(obj1: any, obj2: any): boolean {
		return JSON.stringify(obj1) === JSON.stringify(obj2)
	}

	function concept_key(): string {
		const { stem, sense, part_of_speech } = concept_data.concept
		return `${stem}-${sense}-${part_of_speech}`
	}
</script>

{#if form?.success}
	<!-- this message is ephemeral; it exists because the page was rendered in
	       response to a form submission. it will vanish if the user reloads -->
	<div class="pb-6">
		<div role="alert" class="alert alert-success">
			<Icon icon="mdi:check-circle-outline" class="h-6 w-6" />
			<span class="font-semibold">Successfully updated!</span>
		</div>
	</div>
{/if}

<div class="prose">
	<ConceptKey concept={concept_data.concept} />
</div>

<form method="POST" action="?/update&concept={encodeURIComponent(concept_key())}">
	<section class="py-4">
		<label>
			Level
			<select name="level" bind:value={concept_data.level} class="select">
				{#each levels as level}
					<option value={level}>{level}</option>
				{/each}
			</select>
		</label>
		<br />
		<label>
			Gloss
			<input name="gloss" bind:value={concept_data.gloss} class="input" />
		</label>
	</section>

	<section class="py-4">
		<h2>Advanced Information</h2>
		<label>
			Brief gloss
			<input name="brief_gloss" bind:value={concept_data.brief_gloss} class="input" />
		</label>
		<br />
		<label>
			Categorization
			<input name="categorization" bind:value={concept_data.categorization} class="input" />
		</label>
		<br />
		<label>
			Curated examples
			<textarea name="curated_examples" bind:value={concept_data.curated_examples} class="textarea field-sizing-content" rows="3"></textarea>
		</label>
		<br />
		<label>
			Note
			<input name="note" bind:value={concept_data.note} class="input" />
		</label>
	</section>

	<button class="btn btn-primary" type="submit" disabled={!is_dirty}>Save</button>
	<a href="/?q={concept_data.concept.stem}" class="btn">Cancel</a>
</form>
