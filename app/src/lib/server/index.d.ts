type DbRowConcept = {
	id: string
	stem: string
	part_of_speech: string
	level: string
	categorization: string
	examples: string
	curated_examples: string
	gloss: string
	brief_gloss: string
	occurrences: string
}

interface TransformedConcept extends DbRowConcept {
	categories: string[]
	examples: Example[]
	curated_examples: CuratedExample[]
	occurrences: number
}

interface AugmentedConcept extends TransformedConcept {
	sense: string
}

interface Concept extends AugmentedConcept {}

type CuratedExample = {
	reference: Reference
	argument_phrases: ExampleArgumentStructure
	sentence: string
}

type Example = {
	reference: Reference
	unknown_encoding: string
}

type Reference = {
	source: string //TODO: would like to use `typeof sources[number]` but importing sources breaks other types
	book: string //TODO: would like to use `typeof books[number]` but importing books breaks other types
	chapter: number
	verse: number
}

type ExampleArgumentStructure = ExampleArgumentPhrase[]

type ExampleArgumentPhrase = {
	part_of_speech: string
	role: string
	word: string
}

type SourceData = {
	type: string
	id_primary: string
	id_secondary: string
	id_tertiary: string
	phase_1_encoding: string
	phase_2_encoding: string
	comments: string
	notes: string
}

type SourceEntity = {
	label: string
    features: string
	sense: string
    entity: string
}

type SemanticRepresentation = SourcsEntity[]
