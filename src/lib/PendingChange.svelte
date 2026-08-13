<script>
	import Icon from '@iconify/svelte'
</script>

<div class="border border-info bg-info/5 text-info text-sm p-1 rounded-md flex flex-row items-center gap-1">
	<span class="tooltip" data-tip="Pending change...">
		<Icon icon="material-symbols:pending-outline" class="h-4 w-4" />
	</span>
	<slot />
</div>
