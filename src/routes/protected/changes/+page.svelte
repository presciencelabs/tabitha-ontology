<script lang="ts">
	import type { PageProps } from './$types'

	let { data }: PageProps = $props()

	let changes = $derived(data.change_history)

	function categories_display(value: string[], old: string[] | undefined) {
		if (!old) {
			return value.filter(v => !v.startsWith('never')).join(' | ')
		}

		const display_parts: string[] = []
		for (let i = 0; i < value.length; i++) {
			if (value[i].split(' ')[0] !== old[i].split(' ')[0]) {
				display_parts.push(`'${old[i]}' → '${value[i]}'`)
			}
		}
		return display_parts.join(' | ')
	}
</script>

<div class="pt-5 w-full">
	<div class="prose">
		<h3>Change History</h3>
	</div>
	{#if changes.length > 0}
		<table class="table w-full">
			<thead>
				<tr>
					<th>Action</th>
					<th>Concept</th>
					<th>Change</th>
					<th>Approved</th>
					<th>Applied</th>
					<th>Version</th>
				</tr>
			</thead>
			<tbody>
			{#each changes as change}
				<tr>
					<td>{change.action}</td>
					<td>{change.concept.stem}-{change.concept.sense} ({change.concept.part_of_speech})</td>
					<td>
						<ul class="list list-disc">
							{#if change.data.level}
								{@const { value, old } = change.data.level}
								<li><span class="font-semibold">Level</span>: {old ? `${old} → ${value}` : value}</li>
							{/if}
							{#if change.data.gloss}
								{@const { value, old } = change.data.gloss}
								<li><span class="font-semibold">Gloss</span>: {old !== undefined ? `'${old}' → '${value}'` : value}</li>
							{/if}
							{#if change.data.brief_gloss}
								{@const { value, old } = change.data.brief_gloss}
								<li><span class="font-semibold">Brief gloss</span>: {old !== undefined ? `'${old}' → '${value}'` : value}</li>
							{/if}
							{#if change.data.categories}
								{@const { value, old } = change.data.categories}
								{@const label = change.concept.part_of_speech === 'Verb' ? 'Theta grid' : 'Categorization'}
								<li><span class="font-semibold">{label}</span>: {categories_display(value, old)}</li>
							{/if}
							{#if change.data.curated_examples}
								<li><span class="font-semibold">Curated examples</span> updated</li>
							{/if}
						</ul>
					</td>
					<td>
						{#if change.approved_by}
							{change.approved_by.date.toLocaleString()}
							<!--TODO Show the user name instead, and don't show unless they're authenticated-->
							({change.approved_by.email})
						{/if}
					</td>
					<td>
						{change.applied_date ? change.applied_date.toLocaleString() : 'Pending'}
					</td>
					<td>
						{change.version || ''}
					</td>
				</tr>
			{/each}
			</tbody>
		</table>
	{:else}
		No changes to show yet.
	{/if}
</div>