<script>
	import { createEventDispatcher } from 'svelte'

	/** @type {Example[]} */
	export let examples

	const dispatch = createEventDispatcher()

	$: filters = derive_filters(examples)

	/**
	 * @param {Example[]} examples
	 *
	 * @typedef { string } Category
	 * @typedef { string } Option
	 * @typedef { Set<Option> } Options
	 * @typedef { Map<Category, Options> } Filters
	 *
	 * ______________________________________________
	 * | Category		| Options 							|
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
	 * @returns {Filters}
	 */
	function derive_filters(examples) {
		const filters = new Map()

		const book_names = examples.map(({reference}) => reference.id_primary)
		filters.set('Book', new Set(book_names))

		for (const [category, options] of derive_context_filters()) {
			filters.set(category, options)
		}

		return filters

		function derive_context_filters() {
			/** @type {Filters} */
			const context_filters = new Map()

			examples.forEach(({context}) => {
				for(const category in context) {
					const options = context_filters.get(category) ?? new Set()

					options.add(context[category])

					context_filters.set(category, options)
				}
			})

			return context_filters
		}
	}

	/**
	 * converts things like "Topic NP" to "Topic_NP" or "Outer Adverb" to "Outer_Adverb" so they can be
	 * 	used as property names on objects (since the select binding cannot be a Map)
	 * @param {string} category
	 * @returns {Category}
	 */
	function normalize_category(category) {
		return category.replaceAll(' ', '_')
	}
	/**
	 * reverses the above
	 * @param {Category} category
	 * @returns {string}
	 */
	function denormalize_category(category) {
		return category.replaceAll('_', ' ')
	}

	/**
	 * @typedef { Record<Category, Option> } SelectedFilters – Had to choose an object-based approach here
	 * 	because Svelte doesn't support binding a Map to a select.
	 *
	 * @type { SelectedFilters }
	 */
	const selected_filters = {}

	$: filtered_examples = apply_filters(examples, selected_filters)
	$: dispatch('data-filtered', filtered_examples)

	/**
	 * @param {Example[]} examples
	 * @param {SelectedFilters} filters
	 * @returns {Example[]}
	 */
	function apply_filters(examples = [], filters) {
		const results = examples.filter(is_a_match)

		return results

		/** @param {Example} example */
		function is_a_match(example) {
			return Object.entries(filters).every(satisfies_filter)

			/** @param { [Category, Option] } filter */
			function satisfies_filter([category, option]) {
				const denormalized_category = denormalize_category(category)

				return option === '*' || example.context[denormalized_category] === option || example.reference.id_primary === option
			}
		}
	}
</script>


<!-- <section transition:fade={FADE_CHARACTERISTICS} class="join gap-4 bg-info text-info-content px-4 pb-4 mb-4 overflow-x-auto"> -->
<section class="join gap-4 bg-info text-info-content px-4 pb-4 mb-4 overflow-x-auto">
	{#each filters as [category, options]}
		{@const normalized_category = normalize_category(category)}

		<!-- <label transition:fade={FADE_CHARACTERISTICS} class="join-item flex flex-col"> -->
		<label class="join-item flex flex-col">
			<span class="label">{category}</span>

			<select bind:value={selected_filters[normalized_category]} class="select text-base-content">
				<option value="*" selected>All</option>

				{#each [...options].sort() as option}
					<option value={option}>{option}</option>
				{/each}
			</select>
		</label>
	{/each}
</section>
