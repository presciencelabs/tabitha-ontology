<script>
	import { navigating, page } from '$app/stores'
	import Icon from '@iconify/svelte'
	import { onMount } from 'svelte'
	import { writable } from 'svelte/store'

	export let autofocus = false

	/** @type {string|null} */
	let value = new URLSearchParams($page.url.search).get('q')

	/** @type {string|null} */
	let category = new URLSearchParams($page.url.search).get('category')
	const categories = ['Noun', 'Verb', 'Adjective', 'Adverb', 'Adposition', 'Conjunction', 'Particle', 'Phrasal']

	let scope = writable('')

	onMount(() => {
		const requested_scope = new URLSearchParams($page.url.search).get('scope')
		const stored_scope = localStorage.getItem('search_scope')

		$scope = requested_scope || stored_scope || 'stems'
	})

	/** @param {HTMLInputElement} input */
	function auto_focus(input) {
		autofocus && input.focus()
	}

	function store_scope() {
		localStorage.setItem('search_scope', $scope)

		console.info('search scope saved: ', $scope)
	}
</script>

<!-- https://developer.mozilla.org/en-US/docs/Web/HTML/Element/search -->
<search>
	<!--
		used role="search" ∵ https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/search#search_form_labels_and_accessibility.

		decided against daisy's "join" approach in favor of positioning so I could get a focus ring around the input AND button.  See https://github.com/saadeghi/daisyui/discussions/2400>
	-->
	<form role="search">
		<fieldset class="join gap-0 text-center w-full">
			<label class="btn join-item" class:btn-accent={!category || category === 'all'}>
				All
				<input type="radio" name="category" bind:group={category} value="all" class="hidden" />
			</label>
			{#each categories as category_value}
				<label class="btn join-item" class:btn-accent={category === category_value}>
					{category_value}s
					<input type="radio" name="category" bind:group={category} value="{category_value}" class="hidden" />
				</label>
			{/each}
		</fieldset>

		<br />

		<div class="join w-full">
			<input type="search" name="q" id="q" bind:value use:auto_focus class="input input-bordered input-primary input-lg w-full join-item" />
	
			<select name="scope" bind:value={$scope} on:change={store_scope} class="select select-primary select-lg join-item">
				<option value="stems">Stems only</option>
				<option value="glosses">Glosses only</option>
				<option value="all">Stems and Glosses</option>
			</select>
	
			<button class="btn btn-primary btn-lg join-item">
				<span class="hidden sm:inline">Search</span>
				<Icon icon="material-symbols:search" class="h-6 w-6" />
			</button>
		</div>
	</form>

	<!-- chose visibility here to keep results from jumping up and down -->
	<progress class="progress progress-warning invisible" class:visible={$navigating} />
</search>

<style>
	/* overrode tailwind here to keep from having to use !visible (!important) due to tw's definition order of visible and invisible */
	.visible {
		visibility: visible;
	}
</style>
