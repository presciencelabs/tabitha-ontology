/**
 * Context arguments come after the reference part of an example.
 * eg. for a Verb: 4|1|20|13|p|A|SarahA|AbrahamA||||||| -> p|A|SarahA|AbrahamA|||||||
 * eg. for a Noun: 4|19|23|6|followA|A -> followA|A
 *
 * Each slot (separated by '|') is empty or present based on the word's usage in the example.
 * Each part of speech has a unique, fixed number of 'slots'. For example, Nouns are simple with
 * just two slots indicating the Verb the Noun is attached to, and the semantic role it
 * plays in the clause.
 *
 * @type { import('.').ContextArgumentMap }
 */
export const context_argument_map = new Map([
	['Noun', [
		'Verb',
		'Role',
		'Adposition',
		'Outer Noun',
		'Outer Adjective',
		'Outer Adverb',
	]],
	['Verb', [
		'Topic NP',
		'Polarity',
		'Agent',
		'Patient',
		'State',
		'Source',
		'Destination',
		'Instrument',
		'Beneficiary',
		'Addressee',
		'Predicate Adjective',
		'Propositional Agent',
		'Propositional Patient',
	]],
	['Adjective', [
		'Degree',
		'Verb',
		'Agent',
		'Modified Noun',
		'Modified Adjective',
		'Patient Noun',
		'Patient Clause',
		'Usage',
	]],
	['Adverb', [
		'Degree',
		'Verb',
		'Modified Noun',
		'Modified Adjective',
	]],
	['Adposition', [
		'Noun',
		'Verb',
		'Adjective',
		'Outer Noun',
		'Outer Adjective',
	]],
])
