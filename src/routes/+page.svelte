<script>
	import { clickOutside } from '$lib/helpers/click-outside'
	import { goto } from '$app/navigation'

	/** @type {import('./$types').PageData} */
	export let data
</script>

<h2>Hei, {data.user.name}</h2>
<h3>Om ElevDok</h3>
<p>Her kan du se dokumenter som er arkivert i elevens elevmappe i Public 360 (fylkeskommunens sak/arkiv-system)</p>
<p>Vi jobber med å få på plass dokumenter fra VTFK-arkivet i tillegg, dette kommer fortløpende.</p>
<h3>Hvem har tilgang på hva?</h3>
{#if data.systemInfo.FAGLARER_ACCESS_ENABLED}
	<p>Både kontaktlærere og faglærere har tilgang til å se elevers arkivdokumenter, og til å åpne filene i arkivdokumentet.</p>
{:else if data.systemInfo.IOP_FAGLARER_ACCESS_ENABLED}
	<p>Både kontaktlærere og faglærere har tilgang til å se elevers arkivdokumenter. Kun kontaktlærer og faglærer i IOP-fag har tilgang til å åpne filene i arkivdokumentet.</p>
	<p>Faglærere må derfor henvende seg til sin nærmeste leder ved tjenstlig behov for å lese et dokument. Leder åpner dokumentet i "P360" og lar faglærer lese det.</p>
{:else}
	<p>Både kontaktlærere og faglærere har tilgang til å se elevers arkivdokumenter. Kun kontaktlærer har tilgang til å åpne filene i arkivdokumentet.</p>
	<p>Faglærere må derfor henvende seg til sin nærmeste leder ved tjenstlig behov for å lese et dokument. Leder åpner dokumentet i "P360" og lar faglærer lese det.</p>
{/if}
<p>Merk at alle oppslag av elever, og åpning av filer logges.</p>

<div class="studentLink"><span class="material-symbols-outlined">arrow_forward</span><a href="/elever">Gå til elevoversikten</a></div>

<style>
	.studentLink {
		display: flex;
		align-items: center;
	}
</style>