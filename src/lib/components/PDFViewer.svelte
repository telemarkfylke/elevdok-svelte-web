<script>

  export let base64Data
  export let showPdf = false
  export let title = "Tittel her"
  export let closePdf = () => {
    showPdf = false
  }
  
  let previewModal

  const b64toBlob = async (base64, type = 'application/octet-stream') => {
    return (await fetch(`data:${type};base64,${base64}`)).blob()
  }

  $: if (showPdf) previewModal.showModal()

</script>

<dialog bind:this={previewModal}>
  <form method="dialog">
    <div class="modalTitle">
      <div>
        <h2>{title}</h2>
        <div style="color: var(--error-color);">Ikke last ned, skriv ut, eller ta skjermbilde av dokumentet.</div>
      </div>
      <button on:click={closePdf} title="Lukk modal"><span class="material-symbols-outlined">close</span>Lukk</button>
    </div>
    <div class="rawData">
      {#if showPdf}
        {#await b64toBlob(base64Data, 'application/pdf')}
          Laster pdf...
        {:then blobResponse}
            <object aria-label="PDF viewer" class="pdf-preview" data='{URL.createObjectURL(blobResponse)}#toolbar=0&navpanes=0&zoom=100'>
              <p>Din nettleser støtter ikke PDF-visning</p>
            </object>
        {:catch err}
          Feila
          {err.message}
          <pre>{JSON.stringify(err, null, 2)}</pre>
        {/await}
      {/if}
  </div>
  <!--<pre>{JSON.stringify(test.result.raw, null, 2)}</pre>-->
  </form>
</dialog>

<style>
  object {
    width: 100%;
    min-height: 80vh;
  }
  dialog {
    width: 90vw;
    height: 90vh;
    margin: auto;
    border: none;
    padding: 32px
  }
  dialog::backdrop {
    background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7));
    animation: fade-in 1s;
  }
  .modalTitle {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>