import { bible_books } from '$lib/lookups'
import { context_argument_map } from './examples'

/** @type { import('.').FilterMap } */
const filter_map = initialize()

function initialize() {
	/** @type { import('.').FilterMap } */
	const initialized_filter_map = new Map()

	for (const [part_of_speech, args] of argument_slots.entries()) {
		/** @type { import('.').Filters } */
		const initialized_filters = new Map()

		for (const filter_name of args) {
			/** @type { import('.').Options } */
			const options = new Set()

			initialized_filters.set(filter_name, options)
		}

		initialized_filter_map.set(part_of_speech, initialized_filters)
	}

	return initialized_filter_map
}

/**
 * Example data:
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
 * @returns { import('.').Filters }
 */
export function derive_filters({ part_of_speech }, examples) {
	/** @type { import('.').Filters } */
	const filters = new Map()

	/** @type { import('.').Option[] } */
	const common_options = ['Any']

	const book_names_found_in_examples = examples.sort(by_book_order).map(book_name)
	filters.set('Book', new Set([...common_options, ...book_names_found_in_examples]))

	for (const [name, options] of derive_context_filters(part_of_speech).entries().filter(has_options)) {
		const sorted_options = [...options].sort()

		filters.set(name, new Set([...common_options,...presence_options(name), ...sorted_options]))
	}

	return filters

	/** @param { Example } example */
	function book_name({ reference: { id_primary } }) {
		return id_primary
	}

	/**
	 * @param { Concept['part_of_speech'] } part_of_speech
	 * @returns { import('.').Filters }
	 */
	function derive_context_filters(part_of_speech) {
		/** @type { import('.').Filters } */
		const context_filters = filter_map.get(part_of_speech) ?? new Map()

		examples.forEach(({ context }) => {
			for (const argument_name of Object.keys(context)) {
				context_filters.get(argument_name)?.add(context[argument_name])
			}
		})

		return context_filters
	}

	/** @param { [ContextArgumentName, import('.').Options] } filters  */
	function has_options([, options]) {
		return options.size > 0
	}

	/**
	 * @param { ContextArgumentName } name
	 * @returns { Array<ContextArgumentName> }
	 */
	function presence_options(name) {
		return presence_option_is_applicable(name) ? ['Present', 'Not present'] : []

		/** @param { ContextArgumentName } name */
		function presence_option_is_applicable(name) {
			return !['Role', 'Topic NP', 'Polarity', 'Agent', 'Patient'].includes(name)
		}
	}
}

/**
 * Sorts by Bible book order rather than the natural alphabetical order
 *
 * @param { Example } example_1
 * @param { Example } example_2
 * @returns { number }
 */
export function by_book_order({ reference: { id_primary: book_name_1 } }, { reference: { id_primary: book_name_2 } }) {
	const books_in_order = Object.values(bible_books)

	const index_1 = books_in_order.indexOf(book_name_1)
	const index_2 = books_in_order.indexOf(book_name_2)

	return index_1 - index_2
}
