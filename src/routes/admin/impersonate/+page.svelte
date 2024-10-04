<script>
  import { invalidateAll } from '$app/navigation';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import axios from 'axios';

  /** @type {import('./$types').PageData} */
  export let data

  let impersonationTarget
  let errorMessage = ''
  let isLoading = false

  const setImpersonation = async (type) => {
    errorMessage = ''
    isLoading = true
    try {
      if (!impersonationTarget) throw new Error('Du må skrive et gyldig brukernavn / epost')
      const { data } = await axios.post('/api/admin/setimpersonation', { target: impersonationTarget, type })
      await invalidateAll()
    } catch (error) {
      errorMessage = error.response?.data || error.toString()
    }
    isLoading = false
  }

  const deleteImpersonation = async () => {
    errorMessage = ''
    isLoading = true
    try {
      const { data } = await axios.delete('/api/admin/deleteimpersonation')
      await invalidateAll()
    } catch (error) {
      errorMessage = error.response?.data || error.toString()
    }
    isLoading = false
  }

</script>

{#if data.user.hasAdminRole}
  <h2>Administrator</h2>
  <h3>Logg inn som en annen bruker for feilsøking</h3>
  <p>Merk at dette logges</p>
  <br>
  {#if isLoading}
    <LoadingSpinner />
  {:else}
    {#if data.user.impersonating}
      Du er logget inn som <strong>{data.user.impersonating.target}</strong> med rollen <strong>{data.user.impersonating.type}</strong>
      <button class="filled" on:click={deleteImpersonation}><span class="material-symbols-outlined">cancel</span>Fjern innloggingen som {data.user.impersonating.target}</button>
      <br>  
    {/if}

    <div class="label-input">
      <label for="impersonationTarget">Brukernavnet til den du vil logge inn som (må være korrekt)</label>
      <input bind:value={impersonationTarget} id="impersonationTarget" type="email" placeholder="f. eks per.son@fylke.no" />
    </div>
    <br>
    <div class="actionButtons">
      <button on:click={() => setImpersonation('larer')}>Logg in som lærer</button>
      <button on:click={() => setImpersonation('leder')}>Logg in som leder / rådgiver</button>
    </div>
    {#if errorMessage}
      <div class="error">
        <p>Det skjedde en feil :(</p>
        <p>{JSON.stringify(errorMessage)}</p>
      </div>
    {/if}
  {/if}
{:else}
  Du har ikke tilgang på denne siden
{/if}

<style>
  .actionButtons {
    display: flex;
    gap: 1rem;
  }
  .error {
    color: var(--error-color);
  }
</style>