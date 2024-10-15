<script>
	import { createEventDispatcher } from 'svelte'
	import { by_book_order } from './bible'

	/** @type { Concept } */
	export let concept

	/** @type { Example[] } */
	export let examples

	const dispatch = createEventDispatcher()

	$: filters = derive_filters(concept, examples)

	/**
	 * @typedef { string } Name
	 * @typedef { string } Option
	 * @typedef { Set<Option> } Options
	 * @typedef { Map<Name, Options> } Filters
	 *
	 * ______________________________________________
	 * | Name			| Options 							|
	 * | ------------	| --------------------------- |
	 * | Book			| Genesis, Exodus, ...			|
	 *
	 *    ============= person-B ================
	 * | Verb			| 'tell-D', 'send-A', ...		|
	 * | Role			| 'agent-A', 'state-A', ...	|
	 *
	 *    ============= person-A ================
	 * | Verb			| ...									|
	 * | Role			| ...									|
	 * | Adposition	| ...									|
	 * | Outer Nouns	| ...									|
	 *
	 * @param { Concept } concept
	 * @param { Example[] } examples
	 * @returns { Filters }
	 */
	function derive_filters(concept, examples) {
		const filters = new Map()
		const common_options = ['Any']

		const book_names = examples.sort(by_book_order).map(id_primary)
		filters.set('Book', new Set([...common_options, ...book_names]))

		for (const [name, options] of derive_context_filters()) {
			if (! ['Book', 'Topic NP', 'Polarity', 'Degree'].includes(name)) {
				common_options.push('Present', 'Not present')
			}

			const sorted_options = [...options].sort()

			filters.set(name, new Set([...common_options, ...sorted_options]))
		}

		return filters

		/** @param { Example } example */
		function id_primary({reference: {id_primary}}) {
			return id_primary
		}

		function derive_context_filters() {
			/** @type { Filters } */
			const context_filters = new Map()

			examples.forEach(({context}) => {
				for(const category of Object.keys(context).filter(include)) {
					const options = context_filters.get(category) ?? new Set()

					options.add(context[category])

					context_filters.set(category, options)
				}
			})

			return context_filters

			/** @param { Name } name */
			function include(name) {
				if (concept.part_of_speech === 'Verb' && ['Addressee'].includes(name)) {
					return false
				}

				if (concept.part_of_speech === 'Adjective' && ['Agent', 'Verb'].includes(name)) {
					return false
				}

				return true
			}
		}
	}

	/**
	 * converts things like "Topic NP" to "Topic_NP" or "Outer Adverb" to "Outer_Adverb" so they can be
	 * 	used as property names on objects (since the select binding cannot be a Map)
	 * @param { string } name
	 * @returns { Name }
	 */
	function normalize_name(name) {
		return name.replaceAll(' ', '_')
	}
	/**
	 * reverses the above
	 * @param { Name } name
	 * @returns { string }
	 */
	function denormalize_name(name) {
		return name.replaceAll('_', ' ')
	}

	/**
	 * @typedef { Record<Name, Option> } SelectedFilters – Had to choose an object-based approach here
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

			/** @param { [Name, Option] } filter */
			function satisfies_filter([name, option]) {
				const denormalized_name = denormalize_name(name)

				if (option === 'Any') {
					return true
				}

				if (example.context[denormalized_name] === option) {
					return true
				}

				if (example.reference.id_primary === option) {
					return true
				}

				if (option === 'Present') {
					return !!example.context[denormalized_name]
				}

				if (option === 'Not present') {
					return !example.context[denormalized_name]
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
					<option value={option} selected={i === 0}>{option}</option>
				{/each}
			</select>
		</label>
	{/each}
</section>
