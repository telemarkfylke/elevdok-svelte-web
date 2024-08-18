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

<div class="fileContainer">
  {#if fileLoading}
    <button class="link" disabled><LoadingSpinner width={"1.5"} />{file.title}</button>
  {:else}
    {#if !file.canView}
      <span class="material-symbols-outlined">block</span><button class="link" disabled>{file.title}</button><span>Du har ikke tilgang til filen</span>
    {:else if (!file.isAvailable)}
      <span class="material-symbols-outlined">block</span><button class="link" disabled>{file.title}</button><span>Kun tilgjengelig i arkiv</span>
    {:else}
      <span class="material-symbols-outlined">picture_as_pdf</span><button class="link" on:click={() => {getFileData()}}>{file.title}</button>
    {/if}
  {/if}
</div>

{#if errorMessage}
  <div class="error-box">
    <h4>En feil har oppstått 😩</h4>
    <p>{errorMessage}</p>
  </div>
{/if}

<PDFViewer title={file.title} showPdf={displayFile} {base64Data} closePdf={() => {displayFile = false}} />


<style>
  .fileContainer {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>