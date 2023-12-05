import {augment} from './augmentors'
import {transform} from './transformers'

/**
 * case-insensitive match, will accept % as a wildcard
 *
 * @param {import('@cloudflare/workers-types').D1Database} db
 *
 * @returns {(filter: string) => Promise<Concept[]>}
 */
export const get_concepts = db => async filter => {
	// https://www.sqlite.org/lang_expr.html#the_like_glob_regexp_match_and_extract_operators
	// https://developers.cloudflare.com/d1/platform/client-api/#searching-with-like
	// https://developers.cloudflare.com/d1/platform/client-api/#parameter-binding
	const sql = `
		SELECT *
		FROM Concepts
		WHERE roots like ?
	`

	/** @type {import('@cloudflare/workers-types').D1Result<DbRowConcept>} https://developers.cloudflare.com/d1/platform/client-api/#return-object */
	const {results} = await db.prepare(sql).bind(normalize_wildcards(filter)).all()

	return normalize(results)
}

/**
 * @param {DbRowConcept[]} matches_from_db
 *
 * @returns {Concept[]}
 */
function normalize(matches_from_db) {
	const transformed_matches = matches_from_db.map(transform)

	const augmented_matches = augment(transformed_matches)

	return augmented_matches
}

/**
 * @param {import('@cloudflare/workers-types').D1Database} db
 *
 * @returns {Promise<string>}
 */
export async function get_version(db) {
	const sql = `
		SELECT Version
		FROM OntologyVersion
	`

	// prettier-ignore
	/** @type {string} https://developers.cloudflare.com/d1/platform/client-api/#await-stmtfirstcolumn */
	return await db.prepare(sql).first('Version') || ''
}

/**
 *
 * @param {string} possible_wildard – a string that may contain wildcards, e.g., '*' or '#' or '%'
 * @returns {string} SQL-ready string, i.e., `%` for wildcards
 */
function normalize_wildcards(possible_wildard) {
	return possible_wildard.replace(/[*#]/g, '%')
}