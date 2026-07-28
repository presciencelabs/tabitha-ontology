import { get_all_changes } from '$lib/server/changes/changes.js'

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals: { db_ontology } }) {
	const change_history = await get_all_changes(db_ontology)

	return {
		change_history,
	}
}
