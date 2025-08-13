import { get_concepts, get_filtered_simplification_hints } from '$lib/server/ontology'

/** @type {import('./$types').PageServerLoad} */
export async function load({ url: { searchParams }, locals: { db_ontology } }) {
	/** @type {ConceptSearchFilter} */
	const search_filter = {
		q: '',
		scope: 'stems',
		category: '',
		...Object.fromEntries(searchParams),
	}

	const matches = await get_concepts(db_ontology)(search_filter)
	const how_to_matches = await get_filtered_simplification_hints(db_ontology)(search_filter)

	// filter out the how-to matches that are not associated with a concept
	const unlinked_how_to_matches = how_to_matches.filter(hint =>
		!matches.some(match => `${match.stem}-${match.sense}` === hint.term && hint.part_of_speech === match.part_of_speech))
	// if a remaining how-to result has a sense, it is pending entry into the ontology and should be treated as a concept
	const pending_concepts = unlinked_how_to_matches.filter(hint => ends_in_a_sense(hint.term)).map(create_pending_concept)
	const how_to_hints = unlinked_how_to_matches.filter(hint => !ends_in_a_sense(hint.term))
	
	// group the remaining entries by term and part_of_speech, so we can show all hints for a given term together
	const how_to_results = Object.entries(Object.groupBy(how_to_hints, hint => `${hint.term}|${hint.part_of_speech}`)).map(([key, group]) => {
		const [term, part_of_speech] = key.split('|')
		return {
			term,
			part_of_speech,
			hints: group ?? [],
		}
	})

	const concepts = [...matches, ...pending_concepts]

	const results = {
		concepts,
		how_to_results,
	}
	return { results }

	/**
	 * @param {string} term
	 * @returns {boolean}
	 */
	function ends_in_a_sense(term) {
		const ENDS_IN_A_SENSE = /-[A-Z]$/
		return ENDS_IN_A_SENSE.test(term)
	}

	/**
	 * 
	 * @param {SimplificationHint} hint 
	 * @returns {Concept}
	 */
	function create_pending_concept(hint) {
		const matches = hint.term.match(/^(.*)-([A-Z])$/)
		const [stem, sense] = matches ? [matches[1], matches[2]] : [hint.term, 'A']
		return {
			id: '',
			stem,
			sense,
			part_of_speech: hint.part_of_speech,
			level: guess_level(),
			categorization: '',
			examples: '',
			gloss: 'Not yet in Ontology, but will be added in a future update.',
			brief_gloss: '',
			occurrences: 0,
			categories: [],
			curated_examples: [],
		}

		function guess_level() {
			if (hint.ontology_status.toLowerCase().includes('simple')) {
				return '1'
			} else if (hint.ontology_status.includes('3')) {
				return '3'
			} else {
				return '2'
			}
		}
	}
}
