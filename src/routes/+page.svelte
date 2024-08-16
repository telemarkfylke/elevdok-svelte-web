<script>
	import { clickOutside } from '$lib/helpers/click-outside'
	import { goto } from '$app/navigation'

	/** @type {import('./$types').PageData} */
	export let data
</script>

<h2>Hei, {data.user.name}</h2>
<p>Her kan du se dokumenter som er arkivert i elevens elevmappe i Public 360 (fylkeskommunens sak/arkiv-system)</p>
<p><a href="/elever">Gå til elevoversikten</a></p>

<style>

</style>