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

  let schoolAccess = []

  const getLeaderAccess = async () => {
    errorMessage = ''
    loading = true
    try {
      const { data } = await axios.get(`/api/admin/getleaderaccess`)
      schoolAccess = data
    } catch (error) {
      console.log(error.response?.data)
      errorMessage = error.response?.data || error.toString()
    }
    loading = false
  }

  onMount(async () => {
    await getLeaderAccess()
  })

</script>

{#if data.user.hasAdminRole}
  <h2>Administrator</h2>
  <h3>Se oversikt over ledertilganger</h3>

  <p>
    Tilgang for ledere / rådgivere styres av tilgangsgrupper i EntraID. Servicedesk kan legge til brukere i gruppe A-TILGANG-ELEVDOK-LEDER-{"{SKOLEKORTNAVN}"}.
  </p>
  {#if loading}
    <LoadingSpinner />
  {:else}
    {#each schoolAccess as school}
      <h3>{school.schoolName}</h3>
      {#each school.leaders as leader}
        <div>{leader.displayName} ({leader.principalName})</div>
      {/each}
    {/each}
  {/if}
  {#if errorMessage}
    <div>
      <p>Det skjedde en feil</p>
      <p>{JSON.stringify(errorMessage)}</p>
    </div>
  {/if}
{:else}
  Du har ikke tilgang på denne siden
{/if}

<style>

</style>