<script>
  import File from "$lib/components/File.svelte";
    import { prettyPrintDate } from "$lib/helpers/pretty-date";

  export let document
  export let currentIndex

  let open = false

  const isEven = currentIndex % 2 === 0

</script>

<button class="documentBoxButton{isEven ? ' even' : ''}{open ? ' open' : ''}" on:click={() => {open = !open}}>
  <div class=documentRow>
    <div class="upperTitle">{document.sourceName} {document.documentNumber}</div>
    <div class="title">{document.title}</div>
    <div style="{open ? 'border-bottom: 1px solid var(--primary-color);' : ''}">{prettyPrintDate(document.documentDate)} / {document.category}</div>
  </div>
  <div>
    <span class="material-symbols-outlined">{open ? 'expand_circle_up' : 'expand_circle_down'}</span>
  </div>
  <!--
  <p>{document.title}</p>
  <p>{document.sourceName}</p>
  <p>{document.responsibleEnterprise}</p>
  <p>{document.documentNumber}</p>
  <p>{document.documentDate}</p>
  <p>{document.category}</p>
  <p>{document.documentArchive}</p>
  <p>{document.accessCode}</p>
  {#each document.contacts as contact}
    <p>{contact.name} - {contact.role}</p>
  {/each}
  {#each document.files as file}
    <File {file} {document} />
  {/each}
  -->
</button>
{#if open}
  <div class="documentData{isEven ? ' even' : ''}">
    <div>
      <strong>Dokumentnummer:</strong> {document.documentNumber}
    </div>
    <div>
      <strong>Ansvarlig enhet:</strong> {document.responsibleEnterprise}
    </div>
    <div>
      <strong>Dokumentarkiv:</strong> {document.documentArchive}
    </div>
    <div>
      <strong>Tilgangskode:</strong> {document.accessCode}
    </div>
    {#each document.contacts as contact}
      <div>
        <strong>{contact.role}:</strong> {contact.name}
      </div>
    {/each}
    <div>
      <strong>Filer:</strong>
    </div>
    {#each document.files as file}
      <File {file} {document} />
    {/each}
  </div>
{/if}


<style>
  .documentBoxButton {
    padding: 1rem 2rem;
    color: var(--font-color);
    display: flex;
    width: 100%;
    border: none;
    border-radius: 0px;
    text-align: left;
    justify-content: space-between;
  }
  .documentBoxButton:hover {
    background-color: var(--primary-color-20);
  }
  .documentBoxButton.open {
    border-top: 1px solid var(--primary-color);
    border-left: 1px solid var(--primary-color);
    border-right: 1px solid var(--primary-color);
    /* padding: 1rem 2rem; */
    /* background-color: var(--primary-color-20); */
  }
  .even {
    background-color: var(--secondary-color-10);
  }
  .upperTitle {
    font-size: var(--font-size-small);
  }
  .title {
    font-size: 1.1rem;
    font-weight: bold;
  }
  .documentData {
    padding: 0rem 3rem 1.5rem 3rem;
    border-bottom: 1px solid var(--primary-color);
    border-left: 1px solid var(--primary-color);
    border-right: 1px solid var(--primary-color);
  }

</style>