import type { D1Database } from '@cloudflare/workers-types'
import { get_concepts } from '$lib/server/ontology'

export async function get_concept_for_update(db: D1Database, concept_key: ConceptKey): Promise<ConceptUpdateData|null> {
	const sql = `
		SELECT *
		FROM Concepts
		WHERE stem = ? AND sense = ? AND part_of_speech = ?
	`

	const { stem, sense, part_of_speech } = concept_key
	const result = await db.prepare(sql).bind(stem, sense, part_of_speech).first<DbRowConcept>()
	if (!result) {
		return null
	}

	const { level, gloss, brief_gloss, categorization, curated_examples } = result
	return {
		...concept_key,
		level: level.toString(),
		gloss,
		brief_gloss,
		categorization,
		curated_examples,
	}
}

export async function update_concept(db: D1Database, data: ConceptUpdateData) {
	const sql = `
		UPDATE Concepts
		SET level = ?, gloss = ?, brief_gloss = ?, categorization = ?, curated_examples = ?
		WHERE stem = ? AND sense = ? AND part_of_speech = ?
	`

	const { stem, sense, part_of_speech, level, gloss, brief_gloss, categorization, curated_examples } = data
	await db.prepare(sql).bind(level, gloss, brief_gloss, categorization, curated_examples, stem, sense, part_of_speech).run()
}

export async function create_concept(db: D1Database, data: ConceptCreateData) {
	// TODO calculate id based on alphabetical order, and update all other concepts below
	// For now, simply get the next id for this concept's part of speech
	const pos_concepts = await get_concepts(db)({ q: '*', category: data.part_of_speech, scope: 'stems' })
	const next_id = Math.max(...pos_concepts.map(c => Number(c.id))) + 1

	const sql = `
		INSERT INTO Concepts (id, stem, sense, part_of_speech, level, gloss, brief_gloss, categorization, curated_examples, note, occurrences)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, "", 0)
	`

	const { stem, sense, part_of_speech, level, gloss, brief_gloss, categorization, curated_examples } = data
	await db.prepare(sql)
		.bind(next_id.toString(), stem, sense, part_of_speech, level, gloss, brief_gloss, categorization, curated_examples)
		.run()
}