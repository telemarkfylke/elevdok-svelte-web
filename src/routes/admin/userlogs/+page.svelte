<script>
  import { invalidateAll } from '$app/navigation';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import { prettyPrintDate } from '$lib/helpers/pretty-date';
    import { sleep } from '$lib/helpers/sleep';
  import axios from 'axios';
  import { onMount } from 'svelte';

  /** @type {import('./$types').PageData} */
  export let data

  let errorMessage = ''
  let searchValue
  let loading

  let initialStudentSearch = false
  let studentSearchName = ''
  let selectedStudent = null
  let students = []
  let studentErrorMessage = ''

  let initialUserSearch = false
  let userSearchName = ''
  let selectedUser = null
  let users = []
  let userErrorMessage = ''

  let documentNumber = ''
  let selectedDocumentNumber = null
  let documentNumberErrorMessage = ''

  let logElements = []

  const getLogStudents = async (event) => {
    event.preventDefault()
    students = null
    try {
      const { data } = await axios.get(studentSearchName ? `/api/admin/logstudents?search_name=${studentSearchName}` : '/api/admin/logstudents')
      students = data
    } catch (error) {
      studentErrorMessage = error.response?.data || error.toString()
      students = []
    }
    initialStudentSearch = true
  }

  const getLogUsers = async (event) => {
    event.preventDefault()
    users = null
    try {
      const { data } = await axios.get(userSearchName ? `/api/admin/logusers?search_name=${userSearchName}` : '/api/admin/logusers')
      users = data
    } catch (error) {
      userErrorMessage = error.response?.data || error.toString()
      users = []
    }
    initialUserSearch = true
  }

  const setDocumentNumber = async (event) => {
    event.preventDefault()
    try {
      const documentNumberParts = documentNumber.split('/')
      if (documentNumberParts.length !== 2) {
        throw new Error('Dokumentnummeret må være på formatet 24/12345-3')
      }
      const secondParts = documentNumberParts[1].split('-')
      if (secondParts.length !== 2) {
        throw new Error('Dokumentnummeret må være på formatet 24/12345-2')
      }
      selectedDocumentNumber = documentNumber.trim()
    } catch (error) {
      documentNumberErrorMessage = error.toString()
    }
  }

  const getLogElements = async () => {
    errorMessage = ''
    loading = true
    try {
      let url = '/api/admin/logentries'
      let addedQuery = false
      if (selectedStudent) {
        url += `?student_number=${selectedStudent.elevnummer}`
        addedQuery = true
      }
      if (selectedUser) {
        url += `${addedQuery ? '&' : '?'}user_principal_id=${selectedUser.principalId}`
        addedQuery = true
      }
      if (selectedDocumentNumber) {
        url += `${addedQuery ? '&' : '?'}document_number=${selectedDocumentNumber}`
        addedQuery = true
      }
      const { data } = await axios.get(url)
      logElements = data
    } catch (error) {
      errorMessage = error.response?.data || error.toString()
      logElements = []
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

  <h3>Filter</h3>
  <p>Du kan bruke et filter, eller en kombinasjon av flere</p>

  <!--Elevsøk-->
  {#if !selectedStudent}
    <div><strong>Velg en elev</strong></div>
    <form>
      <div class="button-input">
        <input bind:value={studentSearchName} id="studentSearch" type="text" placeholder="Søk etter elevens navn" />
        <button on:click={getLogStudents}><span class="material-symbols-outlined">search</span> Søk</button>
      </div>
    </form>
    {#if studentErrorMessage}
      <div class="error">
        <p>Det skjedde en feil 😩</p>
        <p>{JSON.stringify(studentErrorMessage)}</p>
      </div>
    {:else if !students}
      <LoadingSpinner />
    {:else if Array.isArray(students)}
      {#if students.length === 0}
        {#if initialStudentSearch}
          <div><i>Ingen elever funnet med navn {studentSearchName}</i></div>
        {/if}
      {:else}
        <div class="searchResult">
          {#each students as student}
            <button class="link" on:click={() => selectedStudent = student}><span class="material-symbols-outlined">person</span>{student.name} ({student.feidenavn})</button>
          {/each}
        </div>
      {/if}
    {:else}
      <div>What</div>
    {/if}
  {:else}
    <div><strong>Valgt elev</strong></div>
    <div class="searchResult">
      <button class="link" on:click={() => selectedStudent = null}><span class="material-symbols-outlined">close</span>{selectedStudent.name} ({selectedStudent.feidenavn})</button>
    </div>
  {/if}
  
  <!--Ansatte søk-->
  {#if !selectedUser}
    <div><strong>Velg en ansatt</strong></div>
    <form>
      <div class="button-input">
        <input bind:value={userSearchName} id="userSearch" type="text" placeholder="Søk etter ansattes navn" />
        <button on:click={getLogUsers}><span class="material-symbols-outlined">search</span> Søk</button>
      </div>
    </form>
    <!-- Hvis jeg bruker en await - og bare bytter en variabel awaiten er avhengig av, så slipper jeg alle state variablene?-->
    {#if userErrorMessage}
      <div class="error">
        <p>Det skjedde en feil 😩</p>
        <p>{JSON.stringify(userErrorMessage)}</p>
      </div>
    {:else if !users}
      <LoadingSpinner />
    {:else if Array.isArray(users)}
      {#if users.length === 0}
        {#if initialUserSearch}
          <div><i>Ingen ansatte funnet med navn {userSearchName}</i></div>
        {/if}
      {:else}
        <div class="searchResult">
          {#each users as user}
            <button class="link" on:click={() => selectedUser = user}><span class="material-symbols-outlined">person</span>{user.name} ({user.principalName})</button>
          {/each}
        </div>
      {/if}
    {:else}
      <div>What</div>
    {/if}
  {:else}
    <div><strong>Valgt ansatt</strong></div>
    <div class="searchResult">
      <button class="link" on:click={() => selectedUser = null}><span class="material-symbols-outlined">close</span>{selectedUser.name} ({selectedUser.principalName})</button>
    </div>
  {/if}

    <!--Dokumentnummer filter-->
    {#if !selectedDocumentNumber}
    <div><strong>Arkiv-dokumentnummer</strong></div>
    <form>
      <div class="button-input">
        <input bind:value={documentNumber} id="documentNumber" type="text" placeholder="eks. 24/12345-2" />
        <button on:click={setDocumentNumber}><span class="material-symbols-outlined">add_circle</span> Legg til i filter</button>
      </div>
    </form>
    {#if documentNumberErrorMessage}
      <div class="error">
        <p>{JSON.stringify(documentNumberErrorMessage)}</p>
      </div>
    {/if}
  {:else}
    <div><strong>Valgt dokumentnummer</strong></div>
    <div class="searchResult">
      <button class="link" on:click={() => selectedDocumentNumber = null}><span class="material-symbols-outlined">close</span>{selectedDocumentNumber}</button>
    </div>
  {/if}
  <br>
  <button class="filled" on:click={() => getLogElements()}>Søk i logger med valgt filter</button>
  <br />
  <div><strong>Logger</strong></div>
  {#if loading}
    <LoadingSpinner />
  {:else}
    <i>Viser {logElements.length} logg-elementer</i>
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
    <div class="error">
      <p>Det har skjedd en feil 😩</p>
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
  .searchResult {
    padding: 1rem;
  }
  .error {
    color: var(--error-color);
  }
</style>