<script>
	import Icon from '@iconify/svelte'
	import { onMount } from 'svelte'

	/** @type {HowToResult} */
	export let how_to

	/** @type {HTMLDialogElement} */
	let dialog

	onMount(() => dialog.showModal())
</script>

<!-- https://daisyui.com/components/modal -->
<dialog bind:this={dialog} on:close class="modal">
	<section class="modal-box max-w-none">
		<form method="dialog">
			<button class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">
				<Icon icon="material-symbols:close" class="h-4 w-4" />
			</button>
		</form>

		<article class="card">
			<main class="card-body">
				<section class="prose card-title max-w-none justify-between">
					<h2 class="relative whitespace-nowrap pb-6">
						{how_to.term}
						<sub class="-bottom-4 -left-4 font-light italic text-neutral-500">{how_to.part_of_speech}</sub>
					</h2>

					<aside class="flex flex-col items-center gap-1 self-start">
						<span class={`badge badge-neutral badge-lg tooltip tooltip-left font-mono`} data-tip="Not in the ontology">
							N/A
						</span>
					</aside>
				</section>

				<section class="prose flex-grow">
					<p>
						Not in the ontology and not expected to be. Click for suggestions.
					</p>
				</section>

				<section class="prose mt-4 max-w-none">
					<h3>Explication hints</h3>
					<table class="table ml-8">
						<thead>
							<tr>
								<th>Structure</th>
								<th>Pairing</th>
								<th>Explication</th>
							</tr>
						</thead>
						<tbody>
							{#each how_to.hints as { structure, explication }}
								<tr>
									<td>{structure || '–'}</td>
									<td>{explication || '–'}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</section>
			</main>
		</article>
	</section>

	<form method="dialog" class="modal-backdrop">
		<button>Close</button>
	</form>
</dialog>
