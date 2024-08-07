import { transform } from './transformers'

// refs:
// 	https://www.sqlite.org/lang_expr.html#the_like_glob_regexp_match_and_extract_operators
// 	https://developers.cloudflare.com/d1/platform/client-api/#searching-with-like
// 	https://developers.cloudflare.com/d1/platform/client-api/#parameter-binding

/**
 * case-insensitive match, will accept % as a wildcard as well as sense-specific search, e.g., love-A
 *
 * @param {import('@cloudflare/workers-types').D1Database} db
 *
 * @returns {(filter: SearchFilter) => Promise<Concept[]>}
 */
export const get_concepts = db => async filter => {
	/** @type {ConceptSearchFilter} */
	const concept_filter = {
		q: '',
		scope: 'stems',
		category: '',
		...filter,
	}

	const query_builder = build_concept_query(db)

	if (concept_filter.category && concept_filter.category !== 'all') {
		query_builder.add_filter('part_of_speech = ?', [concept_filter.category])
	}

	// senses follow the form word-A, /^(.*)-([A-Z])$/
	const matches = concept_filter.q.match(/^(.*)-([A-Z])$/)
	if (matches) {
		const [, stem, sense] = matches
		query_builder
			.add_filter('stem LIKE ?', [stem])
			.add_filter('sense = ?', [sense])

	} else {
		const normalized_q = normalize_wildcards(concept_filter.q)

		/**
		 * @typedef {[filter: string, params: string[]]} FilterArgs
		 * @type {{ [k: string]: FilterArgs }}
		 */
		const scope_filters = {
			stems: ['stem LIKE ?', [normalized_q]],
			glosses: ['gloss LIKE ?', [`%${normalized_q}%`]],
			all: ['stem LIKE ? OR gloss LIKE ?', [normalized_q, `%${normalized_q}%`]],
		}
		query_builder.add_filter(...scope_filters[concept_filter.scope])
	}

	/** @type {import('@cloudflare/workers-types').D1Result<DbRowConcept>} */
	const { results } = await query_builder.prepare().all()

	return normalize(results)

	/**
	 * @param {string} possible_wildard – a string that may contain wildcards, e.g., '*' or '#' or '%'
	 * @returns {string} SQL-ready string, i.e., `%` for wildcards
	 */
	function normalize_wildcards(possible_wildard) {
		return possible_wildard.replace(/[*#]/g, '%')
	}

	/**
	 * @param {DbRowConcept[]} matches_from_db
	 * @returns {Concept[]}
	 */
	function normalize(matches_from_db) {
		return matches_from_db.map(transform)
	}
}

/**
 * @param {import('@cloudflare/workers-types').D1Database} db
 * @returns {Promise<string>}
 */
export async function get_version(db) {
	const sql = `
		SELECT version
		FROM Version
	`

	/** @type {string} https://developers.cloudflare.com/d1/platform/client-api/#await-stmtfirstcolumn */
	return await db.prepare(sql).first('version') || ''
}

/**
 * @param {import('@cloudflare/workers-types').D1Database} db
 * @returns {(term: string) => Promise<SimplificationHint[]>} term is case-insensitive
 */
export const get_simplification_hints = db => async term => {
	const sql = `
		SELECT *
		FROM Complex_Terms
		WHERE term LIKE ?
	`
	/**
	 * LIKE creates case-insensitivity, also supports % as a wildcard if explicitly requested
	 *
	 * handles situations like these:
	 * 	- complex_term=accurate
	 * 	- complex_term=Accurate
	 * 	- complex_term=Accura%
	 * 	- complex_term=accuse-A (results in multiple rows)
	 *
	 * but not this:
	 * 	- complex_term=flourish (this must be flourish-A)
	 *
	 * @type {import('@cloudflare/workers-types').D1Result<SimplificationHint>}
	 */
	let { results } = await db.prepare(sql).bind(term).all()

	if (results.length) {
		return results.map(normalize_results)
	}

	/**
	 * if the term had a sense and there were no matches, no need to try anything else, e.g., love-A
	 */
	const ENDS_IN_A_SENSE = /-[A-Z]$/
	if (ENDS_IN_A_SENSE.test(term)) {
		return []
	}

	const term_w_any_sense = `${term}-_` // _ here means a single character wildcard:  https://sqlite.org/lang_expr.html#like
	/**
	 * handles the following cases:
	 *		- complex_term=flourish
	 *		- complex_term=accuse (results in multiple rows for accuse, both accuse-A and accuse-B)
	 *
	 * @type {import('@cloudflare/workers-types').D1Result<SimplificationHint>}
	 */
	const { results: results_second_try } = await db.prepare(sql).bind(term_w_any_sense).all()

	return results_second_try.map(normalize_results)

	/** @param {SimplificationHint} arg */
	function normalize_results({ term, part_of_speech, structure, pairing, explication }) {
		return { term, part_of_speech, structure, pairing, explication }
	}
}

/**
 * @typedef {{
 * 		add_filter: (filter: string, params: string[]) => ConceptQueryBuilder,
 * 		prepare: () => import('@cloudflare/workers-types').D1PreparedStatement
 * }} ConceptQueryBuilder
 * 
 * @param {import('@cloudflare/workers-types').D1Database} db 
 * @returns { ConceptQueryBuilder }
 */
function build_concept_query(db) {
	/** @type {string[]} */
	const all_filters = []

	/** @type {string[]} */
	const all_params = []

	/**
	 * @param {string} filter
	 * @param {string[]} params
	 * @this {ConceptQueryBuilder}
	 */
	function add_filter(filter, params) {
		all_filters.push(filter)
		all_params.push(...params)
		return this
	}

	/**
	 * @returns {import('@cloudflare/workers-types').D1PreparedStatement}
	 */
	function prepare() {
		const joined_filters = all_filters.map(filter => `(${filter})`).join(' AND ')
		return db.prepare(`
			SELECT *
			FROM Concepts
			WHERE ${joined_filters}`).bind(...all_params)
	}

	return {
		add_filter,
		prepare,
	}
}
