<script>
	import Icon from '@iconify/svelte'
	import { sort_by_book_order } from './bible'
	import SourceData from './SourceData.svelte'
	import TargetData from './TargetData.svelte'
	import { fade } from 'svelte/transition'

	/** @type {Concept} */
	export let concept

	const MAX_EXAMPLES_DISPLAYED = 100

	/**
	 * @typedef { string } Category
	 * @typedef { string } Option
	 * @typedef { Record<Category, Option> } SelectedFilters – Had to choose an object-based approach here
	 * 	because Svelte doesn't support binding a Map to a select.
	 *
	 * @type { SelectedFilters }
	 */
	const selected_filters = {}

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

	/** @type {Example[]}*/
	let all_examples = []

	/** @param {Concept} concept }*/
	async function load_examples({ stem, sense, part_of_speech }) {
		const response = await fetch(`/examples?concept=${stem}-${sense}&part_of_speech=${part_of_speech}&source=Bible`)

		all_examples = await response.json()
	}

	$: sorted_examples = all_examples.toSorted((example_1, example_2) => sort_by_book_order(example_1.reference, example_2.reference))
	$: filters = derive_filters(sorted_examples)
	$: filtered_examples = apply_filters(sorted_examples, selected_filters)
	// $: update_filters(filtered_examples)

	/**
	 * @param {Example[]} examples
	 *
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
	 * @param {Example[]} examples
	 * @param {SelectedFilters} filters
	 * @returns {Example[]}
	 */
	function apply_filters(examples, filters) {
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

	/** @param {Example[]} filtered_examples */
	function update_filters(filtered_examples) {
		filters = derive_filters(filtered_examples)
	}

	// filters may not be applicable at times based upon the the user's selections.  Therefore the choice is to either leave those
	// 	filters in place with the 'All' option or to simply remove them.  At the time of implementation, it seemed easier to
	// 	remove them.  Transitioning them slowly when they disappear or reappear is better than an instantaneous removal/appearance.
	const FADE_CHARACTERISTICS = {
		delay: 100,
		duration: 700
	}

	/** @type {number[]} */
	let retrieval_queue = []

	/**
	 * @param {Event & {currentTarget: HTMLDetailsElement}} event
	 * @param {number} id
	 */
	function handle_queue({ currentTarget: details }, id) {
		if (details.open) {
			retrieval_queue = [...retrieval_queue, id]
		} else {
			retrieval_queue = retrieval_queue.filter(queued_id => queued_id !== id)
		}
	}
</script>

<article class="bg-base-200 p-4 flex flex-col gap-4 prose max-w-none">
	<h3>Bible</h3>

	{#await load_examples(concept)}
		<span class="loading loading-spinner text-warning" />
		loading the examples...
	{:then}
		<section transition:fade={FADE_CHARACTERISTICS} class="join gap-4 bg-info text-info-content px-4 pb-4 mb-4 overflow-x-auto">
			{#each filters as [category, options]}
				{@const normalized_category = normalize_category(category)}

				<label transition:fade={FADE_CHARACTERISTICS} class="join-item flex flex-col">
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

		{#if filtered_examples.length > MAX_EXAMPLES_DISPLAYED}
			<section transition:fade={FADE_CHARACTERISTICS} class="alert alert-warning">
				<Icon icon="ci:triangle-warning" class="h-7 w-7" />

				<span>Only showing the first <span class="font-mono">{MAX_EXAMPLES_DISPLAYED}</span> matching examples</span>
			</section>
		{/if}

		{#each filtered_examples.slice(0, MAX_EXAMPLES_DISPLAYED) as { reference, context }, i}
			{@const { id_primary, id_secondary, id_tertiary } = reference}

			<details on:toggle={event => handle_queue(event, i)} transition:fade={FADE_CHARACTERISTICS} class="collapse collapse-arrow bg-base-100">
				<summary class="collapse-title border border-base-200">
					{id_primary} {id_secondary}:{id_tertiary}

					{#each Object.entries(context) as [key, value]}
						<span class="badge badge-info p-4 badge-outline ml-2">
							<em>{key}: </em>
							<strong class="ml-2 text-info font font-semibold">{value}</strong>
						</span>
					{/each}
				</summary>

				<section class="collapse-content">
					{#if retrieval_queue.includes(i)}
						<SourceData {reference} />

						<h4>
							Generated English text
						</h4>
						<p>
							<TargetData {reference} />
						</p>
					{/if}
				</section>
			</details>
		{/each}
	{/await}
</article>
