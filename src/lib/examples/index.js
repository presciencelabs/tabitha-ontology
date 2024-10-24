/**
 * @typedef { Map<Concept['part_of_speech'], ContextArgumentName[]> } ContextArgumentMap
 *
 * @typeddef { ContextArgumentValue } Option
 * @typeddef { Set<Option> } Options
 * @typeddef { Map<ContextArgumentName, Options> } Filters
 * @typeddef { Map<Concept['part_of_speech'], Filters> } FilterMap
 */

import { context_argument_map } from './examples'
import { by_book_order, derive_filters } from './filters'
import Examples from './Examples.svelte'
import ExampleSummary from './ExampleSummary.svelte'
import Filters from './Filters.svelte'
import SourceData from './SourceData.svelte'
import TargetData from './TargetData.svelte'

export {
	by_book_order,
	context_argument_map,
	derive_filters,
	Examples,
	ExampleSummary,
	Filters,
	SourceData,
	TargetData,
}
