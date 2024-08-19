<script>
  import Document from "$lib/components/Document.svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";
  import Pagination from "$lib/components/Pagination.svelte";

  /** @type {import('./$types').PageData} */
  export let data

  let student = data.students.find(stud => stud.feidenavnPrefix === $page.params.feidenavnPrefix)

  let showArchiveWarning = true
  let documentsPerPage = 10
	let currentPage = 0 // zero-indexed
	let documents = data.studentDocuments.documents
	let originalDocuments = JSON.parse(JSON.stringify(data.studentDocuments.documents))
	let searchValue

	const nextPage = () => {
		currentPage++
	}
	const previousPage = () => {
		currentPage--
	}
	const gotoPage = (pageNumber) => {
		currentPage = pageNumber
	}

	const search = (searchValue) => {
		const filterFunc = (document) => {
			const sv = searchValue.toLowerCase()
      return (document.title.toLowerCase().startsWith(sv) || document.documentNumber.toLowerCase().startsWith(sv) || document.title.toLowerCase().includes(sv))
		}
		documents = originalDocuments.filter(filterFunc)
    currentPage = 0
	}

</script>

<h2>Elevens dokumenter</h2>

<div>
  {#if data.studentDocuments.errors.length > 0 && showArchiveWarning}
    <div class="error-box">
      <div style="display:flex;justify-content:space-between;">
        <h4>Det skjedde en feil under hentingen av elevens dokumenter 😩</h4>
        <button class="link" on:click={() => {showArchiveWarning = false}}>Lukk</button>
      </div>
      <div>
        {#each data.studentDocuments.errors as error}
          <p>• Feil: {error}</p>
        {/each}
      </div>
    </div>
    <br />
  {/if}
  <div class="icon-input" style="width: 16rem;">
    <span class="material-symbols-outlined">search</span>
    <input type="text" bind:value={searchValue} on:input={() => { search(searchValue) }} placeholder="Søk etter tittel eller dokumentnummer" />
  </div>
  {#if originalDocuments.length === 0}
    <br />
    Fant ingen dokumenter for eleven 🤷‍♂️
  {:else if documents.length === 0}
    <br />
    Fant ingen dokumenter med søket
  {:else}
    {#each documents.slice(currentPage * documentsPerPage, (currentPage * documentsPerPage) + documentsPerPage) as document, index}
      <Document {document} currentIndex={index} open={false} />
    {/each}
    <Pagination {currentPage} elementName={'dokumenter'} elementsPerPage={documentsPerPage} maxPageNumbers={11} {gotoPage} {nextPage} {previousPage} numberOfElements={documents.length} />
  {/if}    
</div>
