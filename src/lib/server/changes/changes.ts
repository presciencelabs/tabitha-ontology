import type { User } from '@auth/sveltekit'
import type { D1Database } from '@cloudflare/workers-types'
import { get_concept_for_update } from './concepts'

export async function get_all_changes(db: D1Database): Promise<OntologyChange[]> {
	const sql = `
		SELECT *
		FROM Changes
		ORDER BY approved_date DESC
	`
	const { results } =  await db.prepare(sql).all<DbOntologyChange>()
	return results.map(transform)
}

export async function record_create_concept(db: D1Database, create_data: ConceptCreateData, user: User) {
	const sql = `
		INSERT INTO Changes (
			concept_stem,
			concept_sense,
			concept_part_of_speech,
			data,
			action,
			approved_by_email,
			approved_date
			)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`

	const { stem, sense, part_of_speech, level, gloss, brief_gloss, categories } = create_data
	const change_data: OntologyChangeDataFields = {
		level: { value: level },
		gloss: { value: gloss },
		...(brief_gloss ? { brief_gloss: { value: brief_gloss } } : {}),
		categories: { value: categories.filter(cat => !!cat && !cat.startsWith('never')) },
	}

	await db.prepare(sql)
		.bind(stem, sense, part_of_speech, JSON.stringify(change_data), 'create', user.email!, new Date().toISOString())
		.run()
}

/**
 * Note this must be called before updating the db so that it can properly record the previous values.
 * 
 * @param db 
 * @param update_data 
 * @param user 
 * @returns 
 */
export async function record_update_concept(db: D1Database, update_data: ConceptUpdateData, user: User) {
	const sql = `
		INSERT INTO Changes (
			concept_stem,
			concept_sense,
			concept_part_of_speech,
			data,
			action,
			approved_by_email,
			approved_date
			)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`

	const { stem, sense, part_of_speech } = update_data

	// only record the differences in the data
	const old = (await get_concept_for_update(db, update_data))!

	const fields: (keyof OntologyChangeDataFields)[] = ['level', 'gloss', 'brief_gloss', 'categories', 'curated_examples']
	const change_data: OntologyChangeDataFields = Object.fromEntries(fields.flatMap(field => {
		return old[field].toString() !== update_data[field].toString() ? [[field, { old: old[field], value: update_data[field] }]] : []
	}))

	await db.prepare(sql)
		.bind(stem, sense, part_of_speech, JSON.stringify(change_data), 'update', user.email!, new Date().toISOString())
		.run()
}

function transform(db_change: DbOntologyChange): OntologyChange {
	const {
		id,
		concept_stem, concept_sense, concept_part_of_speech,
		data, action,
		approved_by_email, approved_date,
		applied_date, version,
	} = db_change

	return {
		id,
		concept: {
			stem: concept_stem,
			sense: concept_sense,
			part_of_speech: concept_part_of_speech,
		},
		data: JSON.parse(data) as OntologyChangeDataFields,
		action,
		approved_by: approved_by_email && approved_date ? { email: approved_by_email, date: new Date(approved_date!) } : null,
		applied_date: applied_date ? new Date(applied_date) : null,
		version,
	}
}