<script>
	import Icon from '@iconify/svelte'
	import { sort_by_book_order } from './bible'
	import SourceData from './SourceData.svelte'
	import TargetData from './TargetData.svelte'
	import { fade } from 'svelte/transition'
	import Filters from './Filters.svelte'

	/** @type {Concept} */
	export let concept

	const MAX_EXAMPLES_DISPLAYED = 100

	/** @type {Example[]}*/
	let all_examples = []

	/** @type {Example[]}*/
	let filtered_examples = []

	/** @param {Concept} concept }*/
	async function load_examples({ stem, sense, part_of_speech }) {
		const response = await fetch(`/examples?concept=${stem}-${sense}&part_of_speech=${part_of_speech}&source=Bible`)

		all_examples = await response.json()
	}

	/** @param {CustomEvent<Example[]>} event */
	function update_filtered_examples({ detail }) {
		filtered_examples = detail
			.toSorted((example_1, example_2) => sort_by_book_order(example_1.reference, example_2.reference))
			.slice(0, MAX_EXAMPLES_DISPLAYED)
	}

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
		<Filters examples={all_examples} on:data-filtered={update_filtered_examples} />

		{#if filtered_examples.length > MAX_EXAMPLES_DISPLAYED}
			<section transition:fade={FADE_CHARACTERISTICS} class="alert alert-warning">
				<Icon icon="ci:triangle-warning" class="h-7 w-7" />

				<span>Only showing the first <span class="font-mono">{MAX_EXAMPLES_DISPLAYED}</span> matching examples</span>
			</section>
		{/if}

		{#each filtered_examples as { reference, context }, i}
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
