import type { D1Database } from '@cloudflare/workers-types'
import { get_concept } from '../ontology'

export async function get_concept_for_update(db: D1Database, concept_key: ConceptKey): Promise<ConceptUpdateData|null> {
	const concept = await get_concept(db, concept_key)
	if (!concept) {
		return null
	}

	const { level, gloss, brief_gloss, categorization, curated_examples_raw, note } = concept
	return {
		concept: concept_key,
		level,
		gloss,
		brief_gloss,
		categorization,
		curated_examples: curated_examples_raw,
		note,
	}
}

export async function update_concept(db: D1Database, data: ConceptUpdateData) {
	const sql = `
		UPDATE Concepts
		SET level = ?, gloss = ?, brief_gloss = ?, categorization = ?, curated_examples = ?, note = ?
		WHERE stem = ? AND sense = ? AND part_of_speech = ?
	`

	const { stem, sense, part_of_speech } = data.concept
	const { level, gloss, brief_gloss, categorization, curated_examples, note } = data
	await db.prepare(sql).bind(level, gloss, brief_gloss, categorization, curated_examples, note, stem, sense, part_of_speech).run()
}