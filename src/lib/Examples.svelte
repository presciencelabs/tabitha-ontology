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

	/**
	 * @returns {Promise<[string, Example[]][]>}
	 */
	async function get_examples() {
		const response = await fetch(`/examples?concept=${concept.stem}-${concept.sense}&part_of_speech=${concept.part_of_speech}&source=Bible`)

		/** @type {Example[]}*/
		const examples = await response.json()
		const grouped_examples = Map.groupBy(examples, example => example.reference.id_primary)
		// We want to show the books in Bible order rather than alphabetical order
		return [...grouped_examples.entries()].toSorted((a, b) => bible_books.indexOf(a[0]) - bible_books.indexOf(b[0]))
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
	{:then grouped_examples}
		{#each grouped_examples as [book, examples]}
			<details class="collapse collapse-arrow bg-base-100">
				<summary class="collapse-title border border-base-200">
					book
				</summary>

				<section class="collapse-content">
					{#each examples as { reference, context }, i}
						{@const { id_primary, id_secondary, id_tertiary } = reference}
						{@const context_display = Object.entries(context).map((k, v) => `${k}: ${v}`).join(' | ')}
						<details on:toggle={event => handle_queue(event, i)} class="collapse collapse-arrow bg-base-100">
							<summary class="collapse-title border border-base-200">
								{id_primary} {id_secondary}:{id_tertiary} (<span class="italic">{context_display}</span>)
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
				</section>
			</details>
		{/each}
	{/await}
</article>
