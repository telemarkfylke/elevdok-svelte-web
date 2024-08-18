<script>
  /*
  export let currentPage = 0
  export let numberOfPages = 1
  export let maxPageNumbers = 11
  export let previousPage = () => {
    currentPage--
  }
  export let nextPage = () => {
    currentPage++
  }

  const getPaginationArray = (currentPage, numberOfPages) => {
    const allPages = Array.from(Array(numberOfPages).keys())
    if (numberOfPages <= maxPageNumbers) return allPages
    const createWindowLimit = Math.ceil(maxPageNumbers / 2) // If max 11 => 5 allowed neighbouring numbers, always want 11 total
    if (currentPage < createWindowLimit) return [...allPages.slice(0, maxPageNumbers-2), '...', allPages.length-1]
    if (currentPage > (allPages.length - 1 - createWindowLimit)) return [0, '...', ...allPages.slice(allPages.length - maxPageNumbers + 2, allPages.length)]
    const neighnoursToTheLeft = (maxPageNumbers - 4 - 1) / 2 // One for each of the 0, '...', '...', '', allPages.length-1 below, and one for the current page itself, divided by two (neighnours on each side)
    const neighnoursToTheRight = neighnoursToTheLeft + 1 // slice not including last index
    return [0, '...', ...allPages.slice(currentPage - neighnoursToTheLeft, currentPage + neighnoursToTheRight), '...', allPages.length-1]
  }
    */
</script>
<!--
<div class="pageRow">
  <div>Side {currentPage+1} av {numberOfPages}</div>
    <div class="pageNumbers">
      {#if currentPage === 0}
        <button disabled title="forrige side" class="link pageArrow"><span class="material-symbols-outlined">chevron_left</span></button>
      {:else}
          <button title="forrige side" class="link pageArrow" on:click={() => page--}><span class="material-symbols-outlined">chevron_left</span></button>
      {/if}
      {#each getPaginationArray(currentPage, numberOfPages) as pageNumber}
        {#if pageNumber === '...'}
            <button disabled class="link currentPage">{pageNumber}</button>
        {:else if currentPage === pageNumber}
            <button disabled class="link currentPage">{pageNumber+1}</button>
        {:else}
            <button class="link{page === pageNumber ? ' currentPage' : ''}" on:click={() => page = pageNumber}>{pageNumber+1}</button>
        {/if}
      {/each}
      {#if currentPage === numberOfPages-1}
        <button disabled title="neste side" class="link pageArrow"><span class="material-symbols-outlined">chevron_right</span></button>
      {:else}
        <button title="neste side" class="link pageArrow" on:click={() => currentPage++}><span class="material-symbols-outlined">chevron_right</span></button>
      {/if}
    </div>
  <div class="countInfo">Viser {studentsPerPage > students.length ? students.length : studentsPerPage} av {students.length} elever</div>
</div>

-->
<style>


</style>