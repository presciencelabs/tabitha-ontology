import {semantic_category, sources, theta_grid, usage_info, example_argument_slots} from './lookups'

/**
 * @param {DbRowConcept} match_from_db
 *
 * @returns {TransformedConcept}
 */
export function transform(match_from_db) {
	return {
		...match_from_db,

		categories: transform_categorization(match_from_db),
		examples: transform_examples(match_from_db),
		curated_examples: transform_curated_examples(match_from_db.curated_examples),
		occurrences: transform_occurrences(match_from_db.occurrences),
	}
}

/**
 * @param {string} curated_examples_from_db "4,2,2,2|(NPp|baby|)|(VP|be|)|(APP|beautiful|)|~The baby was beautiful.\n4,17,2,2|(NPp|Xerxes|)|(VP|search|)|(NPP|(APA|beautiful|)|virgin|)|~Xerxes searched for a beautiful virgin.\n4,40,6,29|(NPp|clothes|(NPN|of|flower|)|)|(VP|be|)|(APP|beautiful|(NPN|clothes|(NPN|of|Solomon|)|)|)|~The flower's clothers are more beautiful than Solomon's clothes.\n"
 *
 * @returns {CuratedExample[]}
 */
function transform_curated_examples(curated_examples_from_db) {
	const encoded_examples = curated_examples_from_db.split('\n').filter(field => !!field)
	// 4,2,2,2|(NPp|baby|)|(VP|be|)|(APP|beautiful|)|~The baby was beautiful.
	// 4,17,2,2|(NPp|Xerxes|)|(VP|search|)|(NPP|(APA|beautiful|)|virgin|)|~Xerxes searched for a beautiful virgin.
	// 4,40,6,29|(NPp|clothes|(NPN|of|flower|)|)|(VP|be|)|(APP|beautiful|(NPN|clothes|(NPN|of|Solomon|)|)|)|~The flower's clothes are more beautiful than Solomon's clothes.
	return encoded_examples.map(decode)

	/**
	 * @param {string} encoded_example 4,2,2,2|(NPp|baby|)|(VP|be|)|(APP|beautiful|)|~The baby was beautiful.
	 *
	 * @returns {CuratedExample}
	 */
	function decode(encoded_example) {
		const encoded_reference = encoded_example.split('|')[0] // '4,2,2,2'
		const encoded_argument_phrases = encoded_example.match(/\|(.*)\|~/)?.[1] || '' // (NPp|baby|)|(VP|be|)|(APP|beautiful|)

		return {
			reference: decode_reference(encoded_reference),
			argument_phrases: decode_arguments(encoded_argument_phrases),
			sentence: encoded_example.split('~')[1], // The baby was beautiful.
		}

		/**
		 * @param {string} encoded_argument_phrases '(NPp|baby|)|(VP|be|)|(APP|beautiful|)'
		 *
		 * @returns {ExampleArgumentStructure}
		 */
		function decode_arguments(encoded_argument_phrases) {
			const encoded_phrases = encoded_argument_phrases.match(/\([^)]+\|[^)]+\)/g) || [] // ['(NPp|baby|)', '(VP|be|)', '(APP|beautiful|)']

			const argument_phrases = encoded_phrases.map(decode_phrase)

			return argument_phrases

			/**
			 * @param {string} encoded_phrase '(NPp|baby|)'
			 *
			 * @returns {ExampleArgumentPhrase}
			 */
			function decode_phrase(encoded_phrase) {
				const [type, word] = encoded_phrase.replace(/[()]/g, '').split('|') // ['NPp', 'baby']
				const part_of_speech = `${type[0]}${type[1]}` //'NP' or 'VP' or 'AP'
				const role = type[2] || '' // 'p' or '' or 'P'

				// (NPp|baby|) => { part_of_speech: 'NP', role: 'p', word: 'baby' }
				// (VP|be|) => { part_of_speech: 'VP', role: '', word: 'be' }
				// (APP|beautiful|) => { part_of_speech: 'AP', role: 'P', word: 'beautiful' }
				return {
					part_of_speech,
					role,
					word,
				}
			}
		}
	}
}


/**
 * @type {Record<string, (stem: string, example_slots: Map<string, string>) => string>}
 */
const example_decoders = {
	Noun: transform_noun_example,
	Verb: transform_verb_example,
	Adjective: transform_adjective_example,
	Adverb: transform_adverb_example,
	Adposition: transform_adposition_example,
}

/**
 * Various encoding formats depending on the part-of-speech.
 * Here's one example '4|41|15|36|N|||wineA||'
 * 
 * @param {DbRowConcept} concept_from_db
 *
 * @returns {Example[]}
 */
function transform_examples({examples, part_of_speech, stem}) {
	const encoded_examples = examples.split('\n').filter(field => !!field)

	return encoded_examples.map(decode)

	/**
	 * @param {string} encoded_example 4|41|15|36|N|||wineA|| or 4|19|23|6|followA|A or 4|1|20|13|p|A|SarahA|AbrahamA|||||||
	 *
	 * @returns {Example}
	 * */
	function decode(encoded_example) {
		const [source, book, chapter, verse, ...argument_slots] = encoded_example.split('|')

		const slot_names = example_argument_slots[part_of_speech] || []
		const slots = argument_slots.reduce(example_reducer, new Map())
		
		const decoder = example_decoders[part_of_speech]
		const readable_example = decoder ? decoder(stem, slots) : ''

		return {
			reference: decode_reference([source, book, chapter, verse].join(',')),
			readable_arguments: readable_example,
		}

		/**
		 * Only keep the arguments that are present 
		 * 
		 * @param {Map<string, string>} reduced_slots 
		 * @param {string} slot_value 
		 * @param {number} index 
		 */
		function example_reducer(reduced_slots, slot_value, index) {
			if (slot_value !== '') {
				reduced_slots.set(slot_names[index], slot_value)
			}
			return reduced_slots
		}
	}
}

/**
 * for Agent -> 'Noun Verb'
 * for other roles -> 'Verb Noun(R)' where R is the role character
 * 
 * @param {string} stem 
 * @param {Map<string, string>} example_slots
 * 
 * @returns {string}
 */
function transform_noun_example(stem, example_slots) {
	let role = example_slots.get('Role')
	let verb = example_slots.get('Verb')
	if (role == 'A') {
		return `${stem} ${verb}`
	} else if (role == 'P') {
		return `${verb} ${stem}`
	} else if (role == 'X') {
		return stem
	} else {
		return `${verb} ${stem}(${role})`
	}
}

/**
 * Put the Agent arguments before the verb and all other arguments afterwards.
 * Proposition Arguments are already surrounded by brackets so leave as they are.
 * For the Topic NP, p means 'Most Agent-Like' (active), P means 'Most Patient-Like' (passive)
 * If passive, include (passive)
 * 
 * @param {string} stem 
 * @param {Map<string, string>} example_slots
 * 
 * @returns {string}
 */
function transform_verb_example(stem, example_slots) {
	const parts = [
		example_slots.get('Topic NP') == 'P' ? '(passive)' : '',
		example_slots.get('Agent') || '',
		example_slots.get('Agent Proposition') || '',
		stem,
		example_slots.get('Patient') || '',
		example_slots.has('State') ? example_slots.get('State') + '(S)' : '',
		example_slots.has('Source') ? example_slots.get('Source') + '(s)' : '',
		example_slots.has('Destination') ? example_slots.get('Destination') + '(d)' : '',
		example_slots.has('Instrument') ? example_slots.get('Instrument') + '(I)' : '',
		example_slots.has('Beneficiary') ? example_slots.get('Beneficiary') + '(B)' : '',
		example_slots.get('Patient Proposition') || '',
	]
	return parts.filter(x => x !== '').join(' ')
}

/**
 * Agent Verb (stem ModifiedNoun)
 * Agent Verb (stem (PatientNoun))
 * Agent Verb (stem PatientClause)
 * All arguments except the stem are optional
 * It it currently understood (but not confirmed) that a Modified Noun never occurs with a Patient Noun/Clause
 * 
 * @param {string} stem 
 * @param {Map<string, string>} example_slots
 * 
 * @returns {string}
 */
function transform_adjective_example(stem, example_slots) {
	let degree = example_slots.get('Degree')
	if (degree && degree !== 'N') {
		// N means 'no degree' so don't bother showing it
		stem = `${stem}(${degree})`
	}

	let patient_noun = example_slots.get('Patient Noun') || ''
	if (patient_noun !== '') {
		// the patient noun goes in brackets to indicate the nesting
		patient_noun = `(${patient_noun})`
	}

	const parts = [
		example_slots.get('Agent') || '',
		example_slots.get('Verb') || '',
		'(',
		stem,
		patient_noun,
		example_slots.get('Patient Proposition') || '',
		example_slots.get('Modified Noun') || '',
		')',
	]
	return parts.filter(x => x !== '').join(' ')
}

/**
 * Verb Noun Adjective stem
 * All arguments except the stem are optional
 * 
 * @param {string} stem 
 * @param {Map<string, string>} example_slots
 * 
 * @returns {string}
 */
function transform_adverb_example(stem, example_slots) {
	const parts = [
		example_slots.get('Verb') || '',
		example_slots.get('Noun') || '',
		example_slots.get('Adjective') || '',
		stem,
	]
	return parts.filter(x => x !== '').join(' ')
}

/**
 * In adjunct phrase -> 		Verb (stem Noun)
 * In Noun-Noun relationship ->	(HeadNoun (stem Noun))
 * In adverbial clause -> 		[stem... ]

 * @param {string} stem 
 * @param {Map<string, string>} example_slots
 * 
 * @returns {string}
 */
function transform_adposition_example(stem, example_slots) {
	const verb = example_slots.get('Verb')
	const head_noun = example_slots.get('Head Noun')
	const noun = example_slots.get('Noun') || ''

	if (verb) {
		return `${verb} (${stem} ${noun})`
	} else if (head_noun) {
		return `(${head_noun} (${stem} ${noun}))`
	} else if (example_slots.has('Clause')) {
		return `[${stem}... ]`
	} else {
		return stem
	}
}

/**
 * @param {string} occurrences_from_db
 *
 * @returns {number}
 */
function transform_occurrences(occurrences_from_db) {
	return Number(occurrences_from_db)
}

/**
 * @type {Record<string, (categories_from_db: string) => string[]>}
 */
const categorization_decoders = {
	Adjective: transform_adjective_categorization,
	Adposition: transform_particle_categorization('Adposition'),
	Adverb: transform_particle_categorization('Adverb'),
	Conjunction: transform_particle_categorization('Conjunction'),
	Noun: transform_noun_categorization,
	Verb: transform_verb_categorization,
}

/**
 * @param {DbRowConcept} concept_from_db
 *
 * @returns {string[]}
 */
function transform_categorization({part_of_speech, categorization}) {
	const decoder = categorization_decoders[part_of_speech]

	return decoder ? decoder(categorization) : [...categorization]
}

/**
 * @param {string} categories_from_db '[Aa_][Bb_][Cc_][Dd_][Ee_][Ff_][Gg_][Hh_][Ii_]'
 *
 * @returns {string[]} The decoded categories, e.g., ['Agent-like', '(Patient-like)', '', '', '', '', '', '', '']
 */
function transform_verb_categorization(categories_from_db) {
	const encoded_categories = [...categories_from_db]

	return decode(encoded_categories)

	/**
	 * @param {string[]} encoded_categories various combinations of A-I, a-i and _, e.g., ['A', 'b', '_', '_', '_', '_', '_', '_', '_']
	 */
	function decode(encoded_categories) {
		return encoded_categories.filter(populated).map(encoded_category => theta_grid[encoded_category])

		/**
		 * @param {string} encoded_category
		 */
		function populated(encoded_category) {
			const EMPTY = '_'

			return encoded_category !== EMPTY
		}
	}
}

/**
 * @param {string} categories_from_db '[GCOFQIL][Aa_][Bb_][Cc_][Dd_][Ee_][Ff_]' OR ''
 *
 * position 1 is the semantic category, the remaining positions are the usage, see DisplayOntologyDlg.cppL1064
 *
 * @returns {string[]}
 */
function transform_adjective_categorization(categories_from_db) {
	if (!categories_from_db) {
		return []
	}

	const [encoded_semantic_category, ...encoded_usage] = categories_from_db

	return [
		semantic_category.Adjective[encoded_semantic_category],
		// TODO: look into a fix for this type mismatch warning
		// @ts-ignore
		...transform_particle_categorization('Adjective')(encoded_usage),
	]
}

/**
 * @param {string} encoded_reference four numbers separated by a comma
 *
 * @returns {Reference}
 */
function decode_reference(encoded_reference) {
	const [source_key, book_key, chapter, verse] = encoded_reference.split(',').map(Number)
	const [source, books] = Array.from(sources.entries())[source_key]

	return {
		source,
		book: books[book_key],
		chapter,
		verse,
	}
}

/**
 * @param {string} categories_from_db '[AFGMOTgo]' OR ''
 *
 * @returns {string[]} – e.g., ['Abstracts'] or ['Feminine names'] or ['Not yet categorized']
 */
function transform_noun_categorization(categories_from_db) {
	// prettier-ignore
	return [
		semantic_category.Noun[categories_from_db[0]] || 'No information available yet.',
	]
}

/**
 * @param {Concept['part_of_speech']} part_of_speech
 *
 * @returns {(categories_from_db: string) => string[]}
 */
function transform_particle_categorization(part_of_speech) {
	return decode_categories

	/**
	 * @param {string} categories_from_db
	 *
	 * @returns {string[]}
	 */
	function decode_categories(categories_from_db) {
		if (!categories_from_db) {
			return []
		}

		return [...decode_usage([...categories_from_db])]

		/**
		 * Encoding is a combination of position and case, letters are actually irrelevant.
		 *
		 * @param {string[]} encoded_usage ['Aa_', 'Bb_', 'Cc_']
		 *
		 * @returns {string[]} - various sentences from the usage_info lookup
		 */
		function decode_usage(encoded_usage) {
			return encoded_usage.map((character, i) => `${decode_frequency(character)} ${usage_info[part_of_speech][i]}`)
		}

		/**
		 * @param {string} character - uppercase or lowercase or underscore
		 * @returns {string} - "always" or "sometimes" or "never", respectively
		 */
		function decode_frequency(character) {
			return character === '_' ? 'never' : character === character.toUpperCase() ? 'always' : 'sometimes'
		}
	}
}
