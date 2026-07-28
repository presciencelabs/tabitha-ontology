<script lang="ts">
	import type { PageProps } from './$types'

	let { data }: PageProps = $props()

	let changes = $derived(data.change_history)

	function array_display(value: string[]) {
		return value.filter(v => v.length).join(' | ')
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
					<th>When applied</th>
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
								<li><span class="font-semibold">{label}</span>: {old ? `'${array_display(old)}' → '${array_display(value)}'` : array_display(value)}</li>
							{/if}
							{#if change.data.curated_examples && change.action === 'update'}
								<li><span class="font-semibold">Curated examples</span> updated</li>
							{/if}
						</ul>
					</td>
					<td>
						{change.approved_by.date.toDateString()}
						<!--TODO Don't expose emails unless they're authenticated-->
						({change.approved_by.email})
					</td>
				</tr>
			{/each}
			</tbody>
		</table>
	{:else}
		No changes to show yet.
	{/if}
</div>