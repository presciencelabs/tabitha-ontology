import { Concept, ContextArgumentName, ContextArgumentValue } from '$lib/server'

type ContextArgumentMap = Map<Concept['part_of_speech'], ContextArgumentName[]>

type Option = ContextArgumentValue
type Options = Set<Option>
type Filters = Map<ContextArgumentName, Options>
type FilterMap = Map<Concept['part_of_speech'], Filters>
