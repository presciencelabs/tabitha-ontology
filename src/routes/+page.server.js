import { get_concepts } from '$lib/server/ontology'
import { get_function_words } from '$lib/server/function_words'
import { redirect } from '@sveltejs/kit'

/** @type {import('./$types').PageServerLoad} */
export async function load({ url: { searchParams }, locals: { db_ontology } }) {
	/** @type {ConceptSearchFilter} */
	const search_filter = {
		q: '',
		scope: 'stems',
		category: '',
		...Object.fromEntries(searchParams),
	}

	if (search_filter.scope === 'english') {
		throw redirect(303, `https://targets.tabitha.bible/English/search?q=${search_filter.q}`)
	}

	const results = [
		...await get_concepts(db_ontology)(search_filter),
		...get_function_words(search_filter),
	]

	return {
		results,
	}
}
