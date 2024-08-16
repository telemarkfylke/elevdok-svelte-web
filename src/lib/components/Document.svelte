<script>
  import File from "$lib/components/File.svelte";

  export let document

</script>

<div class="document">
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
</div>


<style>
  .document {
    margin: 0.5rem;
    border: 1px solid black;
  }
  p {
    padding: 0rem;
    margin: 0rem;
  }
</style>