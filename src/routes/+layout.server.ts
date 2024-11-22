import { get_version } from '$lib/server/ontology'
import { error } from '@sveltejs/kit'

export async function load({ locals, platform }) {
	if (!platform?.env.DB_Ontology) {
		throw error(500, `database missing from platform arg: ${JSON.stringify(platform)}`)
	}

	const version = await get_version(platform.env.DB_Ontology)

	const session = await locals.auth()

	return {
		version,
		user: session?.user,
	}
}
