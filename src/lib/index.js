import Brand from './Brand.svelte'
import { DetailedCard, SummaryCard } from './card'
import Details from './Details.svelte'
import DisplayPreference from './DisplayPreference.svelte'
import { Examples } from './examples'
import Meaning from './Meaning.svelte'
import Level from './Level.svelte'
import Occurrences from './Occurrences.svelte'
import Search from './Search.svelte'
import Table from './Table.svelte'

export {
	Brand,
	DetailedCard,
	Details,
	DisplayPreference,
	Examples,
	Level,
	Meaning,
	Occurrences,
	Search,
	SummaryCard,
	Table,
}

// TODO: remove when this is fixed https://github.com/cloudflare/workers-sdk/issues/10755
import { DOMParser } from '@xmldom/xmldom'
globalThis.DOMParser = DOMParser
console.log('polyfilled DOMParser')