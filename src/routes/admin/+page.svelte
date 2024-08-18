<script>
  /** @type {import('./$types').PageData} */
	export let data
</script>

{#if data.user.hasAdminRole}
  <h2>Administrator</h2>
  <div class="adminOption">
    <span class="material-symbols-outlined">supervisor_account</span><a href="/admin/impersonate">Logg inn som en annen bruker for feilsøking</a>
  </div>
  <div class="adminOption">
    <span class="material-symbols-outlined">history</span><a href="/admin/userlogs">Se logg</a>
  </div>
  <br>
{:else}
  Du har ikke tilgang på denne siden
{/if}

<style>
  .adminOption {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>