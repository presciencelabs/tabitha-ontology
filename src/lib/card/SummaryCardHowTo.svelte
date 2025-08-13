<script>
	import Icon from '@iconify/svelte'
    import DetailedCardHowTo from './DetailedCardHowTo.svelte'

	/** @type {HowToResult} */
	export let how_to

	let expanded = false
	function expand() {
		expanded = true
	}
	function close() {
		expanded = false
	}
</script>

<article class="card card-bordered grow shadow-lg dark:shadow-neutral-700">
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

		<section class="card-actions mt-4 justify-end">
			<button on:click={expand} class="btn btn-primary btn-sm">
				EXPAND <Icon icon="gg:maximize-alt" class="h-4 w-4" />
			</button>
		</section>
	</main>
</article>

{#if expanded}
	<DetailedCardHowTo {how_to} on:close={close} />
{/if}
