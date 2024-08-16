<script>
  import axios from "axios";
  import PDFViewer from "./PDFViewer.svelte";
  import LoadingSpinner from "./LoadingSpinner.svelte";

  export let file
  export let document

  const studentFeidenavnPrefix = document.feidenavn.substring(0, document.feidenavn.indexOf('@'))
  const pdfUrl = `/api/students/${studentFeidenavnPrefix}/source/${document.source}/file/${file.id}`

  let displayFile = false
  let fileLoading = false
  let errorMessage = ""
  let base64Data

  const getFileData = async () => {
    console.log("hallo")
    errorMessage = ""
    fileLoading = true
    try {
      const studentFeidenavnPrefix = document.feidenavn.substring(0, document.feidenavn.indexOf('@'))
      const { data } = await axios.get(`/api/students/${studentFeidenavnPrefix}/source/${document.source}/file/${file.id}`)
      base64Data = data
      fileLoading = false
      displayFile = true
    } catch (error) {
      fileLoading = false
      console.log(error)
      errorMessage = `Det oppstod en feil ved henting av fil: ${error}`
    }
  }
</script>

{#if fileLoading}
  <button disabled><LoadingSpinner width={"1.5"} />{file.title}</button>
{:else}
  {#if !file.canView}
    <button disabled><span class="material-symbols-outlined">block</span>{file.title}<br />Du har ikke tilgang til filen</button>
  {:else if (!file.isAvailable)}
    <button disabled><span class="material-symbols-outlined">block</span>{file.title}<br />Kun tilgjengelig i arkiv</button>
  {:else}
    <button on:click={() => {getFileData()}}><span class="material-symbols-outlined">picture_as_pdf</span>{file.title}</button>
  {/if}
{/if}

{#if errorMessage}
  <div class="error-box">
    <h4>En feil har oppstått 😩</h4>
    <p>{errorMessage}</p>
  </div>
{/if}

<PDFViewer showPdf={displayFile} {base64Data} closePdf={() => {displayFile = false}} />


<style>

</style>