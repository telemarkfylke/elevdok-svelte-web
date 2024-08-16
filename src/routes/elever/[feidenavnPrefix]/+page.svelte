<script>
  import Document from "$lib/components/Document.svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";

  /** @type {import('./$types').PageData} */
  export let data

  let student = data.students.find(stud => stud.feidenavnPrefix === $page.params.feidenavnPrefix)

</script>

<h2>Elevens dokumenter</h2>

<div>
  {JSON.stringify(data.studentDocuments.errors)}
  {#each data.studentDocuments.documents as document}
    <Document {document} />
  {/each}
</div>
