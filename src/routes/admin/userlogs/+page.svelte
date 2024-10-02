<script>
  import { invalidateAll } from '$app/navigation';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import { prettyPrintDate } from '$lib/helpers/pretty-date';
  import axios from 'axios';
  import { onMount } from 'svelte';

  /** @type {import('./$types').PageData} */
  export let data

  let errorMessage = ''
  let searchValue
  let loading

  let logElements = []

  const getLogElements = async () => {
    errorMessage = ''
    loading = true
    try {
      const { data } = await axios.get(`/api/admin/logentries${searchValue ? '?search='+searchValue : ''}`)
      logElements = data
    } catch (error) {
      console.log(error.response?.data)
      errorMessage = error.response?.data || error.toString()
    }
    loading = false
  }

  onMount(async () => {
    await getLogElements()
  })

</script>

{#if data.user.hasAdminRole}
  <h2>Administrator</h2>
  <h3>Se og søk i brukerlogger</h3>
  <div class="label-input">
    <label for="impersonationTarget">Søk etter brukernavn, navn, filtittel, dokumentnummer</label>
    <input bind:value={searchValue} id="impersonationTarget" type="email" placeholder="f. eks per.son@fylke.no" />
  </div>
  <br>
  <button on:click={() => getLogElements()}>Søk</button>
  {#if loading}
    <LoadingSpinner />
  {:else}
    {#each logElements as logElement}
      <div class="logElement">
        <div><strong>Logg-id</strong>: {logElement._id}</div>
        <div><strong>Dato</strong>: {prettyPrintDate(logElement.timestamp, true)}</div>
        <div><strong>Bruker</strong>: {logElement.user.name} ({logElement.user.principalName}) ({logElement.user.principalId}) ({logElement.user.role})</div>
        {#if logElement.user.impersonating}
          <div><strong>ADMIN logget inn som</strong>: {logElement.user.impersonating.target}</div>
        {/if}
        <div><strong>Elev</strong>: {logElement.student.name} ({logElement.student.feidenavn})</div>
        <div><strong>Tilgangstype</strong>: {logElement.accessType}</div>
        <div><strong>Handling</strong>: {logElement.action}</div>
        {#if logElement.file}
          <div><strong>Fil</strong>: {logElement.file.title} - {logElement.file.documentNumber} - ({logElement.file.sourceId})</div>
        {/if}
      </div>
    {/each}
  {/if}
  {#if errorMessage}
    <div>
      <p>FEIL</p>
      <p>{JSON.stringify(errorMessage)}</p>
    </div>
  {/if}
{:else}
  Du har ikke tilgang på denne siden
{/if}

<style>
  .logElement {
    padding: 1rem 1rem;
  }
  .logElement:nth-child(even) {
		background-color: var(--primary-color-10);
	}
</style>