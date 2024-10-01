<script>
	import SourceData from './SourceData.svelte'
	import TargetData from './TargetData.svelte'

	/** @type {Concept} */
	export let concept

	const bible_books = [
		'Genesis',
		'Exodus',
		'Leviticus',
		'Numbers',
		'Deuteronomy',
		'Joshua',
		'Judges',
		'Ruth',
		'1 Samuel',
		'2 Samuel',
		'1 Kings',
		'2 Kings',
		'1 Chronicles',
		'2 Chronicles',
		'Ezra',
		'Nehemiah',
		'Esther',
		'Job',
		'Psalms',
		'Proverbs',
		'Ecclesiastes',
		'Song of Solomon',
		'Isaiah',
		'Jeremiah',
		'Lamentations',
		'Ezekiel',
		'Daniel',
		'Hosea',
		'Joel',
		'Amos',
		'Obadiah',
		'Jonah',
		'Micah',
		'Nahum',
		'Habakkuk',
		'Zephaniah',
		'Haggai',
		'Zechariah',
		'Malachi',
		'Matthew',
		'Mark',
		'Luke',
		'John',
		'Acts',
		'Romans',
		'1 Corinthians',
		'2 Corinthians',
		'Galatians',
		'Ephesians',
		'Philippians',
		'Colossians',
		'1 Thessalonians',
		'2 Thessalonians',
		'1 Timothy',
		'2 Timothy',
		'Titus',
		'Philemon',
		'Hebrews',
		'James',
		'1 Peter',
		'2 Peter',
		'1 John',
		'2 John',
		'3 John',
		'Jude',
		'Revelation',
	]

	/** @type {Example[]}*/
	let all_examples = []

	/** @type {Example[]}*/
	let filtered_examples = []

	/** @type {Map<string, Set<string>>}*/
	const filter_options = new Map()

	async function get_examples() {
		const response = await fetch(`/examples?concept=${concept.stem}-${concept.sense}&part_of_speech=${concept.part_of_speech}&source=Bible`)

		all_examples = await response.json()

		// We want to show the books in Bible order rather than alphabetical order
		all_examples.sort((a, b) => bible_books.indexOf(a.reference.id_primary) - bible_books.indexOf(b.reference.id_primary))

		// get the filter options
		filter_options.set('Book', new Set(all_examples.map(example => example.reference.id_primary)))

		all_examples.forEach(example => {
			for (const key in example.context) {
				const values = filter_options.get(key) ?? new Set()
				values.add(example.context[key])
				filter_options.set(key, values)
			}
		})

		apply_filters()
	}

	function apply_filters() {
		retrieval_queue = []

		// TODO get the filter values based on the 'example_filter_X' name, and filter the examples

		filtered_examples = all_examples.slice(0, 100)
	}

	/** 
	 * @param {string} key
	 */
	function sanitize_key(key) {
		return key.split(' ').join('_')
	}

	/** @type {number[]} */
	let retrieval_queue = []

	/**
	 * @param {Event & {currentTarget: HTMLDetailsElement}} event
	 * @param {number} id
	 */
	function handle_queue({currentTarget: details}, id) {
		if (details.open) {
			retrieval_queue = [...retrieval_queue, id]
		} else {
			retrieval_queue = retrieval_queue.filter(queued_id => queued_id !== id)
		}
	}
</script>

<article class="bg-base-200 p-4 flex flex-col gap-4 prose max-w-none">
	<h3>Bible</h3>
	
	{#await get_examples()}
		<span class="loading loading-spinner text-warning" />
		loading the examples...
	{:then}
		<div>
			{#each filter_options as [key, values]}
				{@const sanitized_key = sanitize_key(key)}
				<label for="example_filter_{sanitized_key}">
					{key}
				</label>
				<select name="example_filter_{sanitized_key}" on:change={apply_filters} class="select select-primary select-md">
					<option value="*">All</option>
					{#each values as value}
						<option value="{value}">{value}</option>
					{/each}
				</select>
			{/each}
		</div>
		{#each filtered_examples as { reference, context }, i}
			{@const { id_primary, id_secondary, id_tertiary } = reference}
			{@const context_display = Object.entries(context).map(([k, v]) => `${k}: ${v}`).join(' | ')}

			<details on:toggle={event => handle_queue(event, i)} class="collapse collapse-arrow bg-base-100">
				<summary class="collapse-title border border-base-200">
					{id_primary} {id_secondary}:{id_tertiary} | <span class="italic">{context_display}</span> |
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
