<script>
	import { createEventDispatcher } from 'svelte'
	import { derive_filters } from './filters'

	/** @type { Concept } */
	export let concept

	/** @type { Example[] } */
	export let examples

	const dispatch = createEventDispatcher()

	$: filters = derive_filters(concept, examples)

	/**
	 * converts things like "Topic NP" to "Topic_NP" or "Outer Adverb" to "Outer_Adverb" so they can be
	 * 	used as property names on objects (since the select binding cannot be a Map in Svelte)
	 *
	 * @typedef { string } ContextArgumentNameNormalized
	 *
	 * @param { ContextArgumentName } name
	 * @returns { ContextArgumentNameNormalized }
	 */
	function normalize_name(name) {
		return name.replaceAll(' ', '_')
	}
	/**
	 * reverses the above
	 *
	 * @param { ContextArgumentNameNormalized } name
	 * @returns { ContextArgumentName }
	 */
	function denormalize_name(name) {
		return name.replaceAll('_', ' ')
	}

	/**
	 * @typedef { Record<ContextArgumentNameNormalized, import('.').Option> } SelectedFilters – Had to choose an object-based approach here
	 * 	because Svelte doesn't support binding a Map to a select.
	 *
	 * @type { SelectedFilters }
	 */
	const selected_filters = {}

	$: filtered_examples = apply_filters(examples, selected_filters)
	$: dispatch('data-filtered', filtered_examples)

	/**
	 * @param { Example[] } examples
	 * @param { SelectedFilters } filters
	 * @returns { Example[] }
	 */
	function apply_filters(examples = [], filters) {
		const results = examples.filter(is_a_match)

		return results

		/** @param { Example } example */
		function is_a_match(example) {
			return Object.entries(filters).every(satisfies_filter)

			/** @param { [ContextArgumentNameNormalized, import('.').Option] } filter */
			function satisfies_filter([normalized_name, option]) {
				const argument_name = denormalize_name(normalized_name)

				if (option === 'Any') {
					return true
				}

				if (example.context[argument_name] === option) {
					return true
				}

				if (example.reference.id_primary === option) {
					return true
				}

				if (option === 'Present') {
					return !!example.context[argument_name]
				}

				if (option === 'Not present') {
					return !example.context[argument_name]
				}

				return false
			}
		}
	}
</script>


<section class="join gap-4 bg-info text-info-content px-4 pb-4 mb-4 overflow-x-auto">
	{#each filters as [name, options]}
		{@const normalized_name = normalize_name(name)}

		<label class="join-item flex flex-col">
			<span class="label">{name}</span>

			<select bind:value={selected_filters[normalized_name]} class="select text-base-content">
				{#each [...options] as option, i}
					{@const is_first_option = i === 0}

					<option value={option} selected={is_first_option}>{option}</option>
				{/each}
			</select>
		</label>
	{/each}
</section>
