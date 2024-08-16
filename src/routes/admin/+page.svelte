<script>
  import { invalidateAll } from '$app/navigation';
  import axios from 'axios';

  /** @type {import('./$types').PageData} */
  export let data

  let impersonationTarget
  let errorMessage = ''

  const setImpersonation = async (type) => {
    errorMessage = ''
    try {
      if (!impersonationTarget) throw new Error('Du må skrive et gyldig brukernavn / epost')
      const { data } = await axios.post('/api/admin/setimpersonation', { target: impersonationTarget, type })
      invalidateAll()
      return data
    } catch (error) {
      console.log(error.response?.data)
      errorMessage = error.response?.data || error.toString()
    }
  }

  const deleteImpersonation = async () => {
    errorMessage = ''
    try {
      const { data } = await axios.delete('/api/admin/deleteimpersonation')
      invalidateAll()
      return data
    } catch (error) {
      console.log(error)
      errorMessage = error.response?.data || error.toString()
    }
  }

</script>

{#if data.user.hasAdminRole}
  <h2>Administrator</h2>
  <h3>Logg inn som en annen bruker for feilsøking</h3>
  <p>Merk at dette logges</p>
  <br>
  {#if data.user.impersonating}
    Du er allerede logget inn som <strong>{data.user.impersonating.target}</strong> med rollen <strong>{data.user.impersonating.type}</strong>
    <button on:click={deleteImpersonation}>Fjern innloggingen som {data.user.impersonating.target}</button>
    <br>  
  {/if}

  <div class="label-input">
    <label for="impersonationTarget">Brukernavnet til den du vil logge inn som (må være nøyaktig)</label>
    <input bind:value={impersonationTarget} id="impersonationTarget" type="email" placeholder="f. eks per.son@fylke.no" />
  </div>
  <br>
  <button on:click={() => setImpersonation('larer')}>Logg in som lærer</button>
  <button on:click={() => setImpersonation('leder')}>Logg in som leder / rådgiver</button>
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

</style>