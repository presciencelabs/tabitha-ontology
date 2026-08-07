<script lang="ts">
	import Icon from '@iconify/svelte'

	let { data } = $props()

	let syncing = $state(false)
	let sync_status_message = $state('')
	let sync_status_type: 'idle' | 'success' | 'error' = $state('idle')

	async function trigger_sync_complex_terms() {
		syncing = true
		sync_status_message = 'Fetching and syncing complex terms spreadsheet...'
		sync_status_type = 'idle'

		try {
			const res = await fetch('/protected/sync-complex-terms', { method: 'POST' })
			const result = await res.json()

			if (res.ok && result.success) {
				const time = new Date(result.timestamp).toLocaleTimeString()
				sync_status_message = `Successfully synced ${result.count} complex terms at ${time}.`
				sync_status_type = 'success'
			} else {
				sync_status_message = result.message || result.error || 'Failed to sync complex terms.'
				sync_status_type = 'error'
			}
		} catch (err: unknown) {
			sync_status_message = err instanceof Error ? err.message : 'An error occurred during sync.'
			sync_status_type = 'error'
		} finally {
			syncing = false
		}
	}

	let applying_changes = $state(false)
	let apply_status_message = $state('')
	let apply_status_type: 'idle' | 'success' | 'error' = $state('idle')

	async function trigger_apply_changes() {
		applying_changes = true
		apply_status_message = 'Applying pending changes...'
		apply_status_type = 'idle'

		try {
			const res = await fetch('/protected/changes/apply-pending', { method: 'POST' })
			const result = await res.json()

			if (res.ok && result.success) {
				const time = new Date(result.timestamp).toLocaleTimeString()

				const success_message = `Successfully applied ${result.count} changes at ${time} for new Ontology Version ${result.version}.`
				const failed_message = result.failed > 0 ? `Failed to apply ${result.failed} changes.` : ''
				apply_status_message = `${success_message} ${failed_message}`
				apply_status_type = result.failed === 0 ? 'success' : 'error'
			} else {
				apply_status_message = result.message || result.error || 'Failed to apply complex terms.'
				apply_status_type = 'error'
			}
		} catch (err: unknown) {
			apply_status_message = err instanceof Error ? err.message : 'An error occurred during apply.'
			apply_status_type = 'error'
		} finally {
			applying_changes = false
		}
	}
</script>

<div class="space-y-6">
	<section>
		<h1 class="text-2xl font-bold mb-2">Ontology Management</h1>
		<p class="text-base-content/70">Manage ontology concepts and data synchronization.</p>
	</section>

	<div class="grid gap-4 md:grid-cols-2">
		<div class="card bg-base-200 shadow-sm border border-base-300 p-5">
			<h2 class="text-lg font-semibold mb-2 flex items-center gap-2">
				<Icon icon="material-symbols:sync" class="w-5 h-5 text-primary" />
				Complex Terms Synchronization
			</h2>
			<p class="text-sm text-base-content/70 mb-4">
				Sync simplification hints and complex terms from the latest Google Sheet document into D1.
			</p>
			<div>
				<button onclick={trigger_sync_complex_terms} disabled={syncing} class="btn btn-primary">
					{#if syncing}
						<span class="loading loading-spinner loading-xs"></span>
						Syncing...
					{:else}
						<Icon icon="material-symbols:sync" class="w-4 h-4" />
						Sync Complex Terms Now
					{/if}
				</button>
			</div>

			{#if sync_status_message}
				<div class="alert mt-4 text-sm {sync_status_type === 'success' ? 'alert-success' : sync_status_type === 'error' ? 'alert-error' : 'alert-info'}">
					{#if sync_status_type === 'success'}
						<Icon icon="material-symbols:check-circle-outline" class="w-5 h-5" />
					{:else if sync_status_type === 'error'}
						<Icon icon="material-symbols:error-outline" class="w-5 h-5" />
					{:else}
						<Icon icon="material-symbols:info-outline" class="w-5 h-5" />
					{/if}
					<span>{sync_status_message}</span>
				</div>
			{/if}
		</div>

		{#if data?.can_add}
			<div class="card bg-base-200 shadow-sm border border-base-300 p-5">
				<h2 class="text-lg font-semibold mb-2 flex items-center gap-2">
					<Icon icon="material-symbols:add" class="w-5 h-5 text-accent" />
					Concepts
				</h2>
				<p class="text-sm text-base-content/70 mb-4">
					Create and manage ontology concepts.
				</p>
				<div>
					<a class="btn btn-accent" href="/protected/concept/create">
						<Icon icon="material-symbols:add" class="w-4 h-4" />
						Add Concept
					</a>
				</div>
			</div>
		{/if}

		<div class="card bg-base-200 shadow-sm border border-base-300 p-5">
			<h2 class="text-lg font-semibold mb-2 flex items-center gap-2">
				<Icon icon="material-symbols:published-with-changes" class="w-5 h-5 text-primary" />
				Pending changes
			</h2>
			<p class="text-sm text-base-content/70 mb-4">
				View and apply pending changes to the Ontology. Applying changes will make a new downloadable Ontology Version.
			</p>
			<div>
				<button onclick={trigger_apply_changes} disabled={applying_changes} class="btn btn-primary">
					{#if applying_changes}
						<span class="loading loading-spinner loading-xs"></span>
						Applying changes...
					{:else}
						<Icon icon="material-symbols:published-with-changes" class="w-4 h-4" />
						Apply changes now
					{/if}
				</button>
			</div>

			{#if apply_status_message}
				<div class="alert mt-4 text-sm {apply_status_type === 'success' ? 'alert-success' : apply_status_type === 'error' ? 'alert-error' : 'alert-info'}">
					{#if apply_status_type === 'success'}
						<Icon icon="material-symbols:check-circle-outline" class="w-5 h-5" />
					{:else if apply_status_type === 'error'}
						<Icon icon="material-symbols:error-outline" class="w-5 h-5" />
					{:else}
						<Icon icon="material-symbols:info-outline" class="w-5 h-5" />
					{/if}
					<span>{apply_status_message}</span>
				</div>
			{/if}
		</div>
	</div>
</div>