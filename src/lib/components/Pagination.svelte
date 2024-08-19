<script>
  export let elementsPerPage = 10
  export let numberOfElements = 10
  export let currentPage = 0
  export let maxPageNumbers = 11
  export let elementName = "rader"

  export let gotoPage = (pageNumber) => {
    currentPage = pageNumber
  }
  export let previousPage = () => {
    currentPage--
  }
  export let nextPage = () => {
    currentPage++
  }

  let numberOfPages = Math.ceil(numberOfElements / elementsPerPage)

  $: numberOfPages = Math.ceil(numberOfElements / elementsPerPage)

  const getPaginationArray = (currentPage, numberOfPages) => {
    const allPages = Array.from(Array(numberOfPages).keys())
    if (numberOfPages <= maxPageNumbers) return allPages
    const createWindowLimit = Math.ceil(maxPageNumbers / 2) // If max 11 => 5 allowed neighbouring numbers, always want 11 total
    if (currentPage < createWindowLimit) return [...allPages.slice(0, maxPageNumbers-2), '...', allPages.length-1]
    if (currentPage > (allPages.length - 1 - createWindowLimit)) return [0, '...', ...allPages.slice(allPages.length - maxPageNumbers + 2, allPages.length)]
    const neighborsToTheLeft = (maxPageNumbers - 4 - 1) / 2 // One for each of the 0, '...', '...', '', allPages.length-1 below, and one for the current page itself, divided by two (neighbors on each side)
    const neighborsToTheRight = neighborsToTheLeft + 1 // slice not including last index
    return [0, '...', ...allPages.slice(currentPage - neighborsToTheLeft, currentPage + neighborsToTheRight), '...', allPages.length-1]
  }
</script>

<div class="pageRow">
  <div>Side {currentPage+1} av {numberOfPages}</div>
    <div class="pageNumbers">
      {#if currentPage === 0}
        <button disabled title="forrige side" class="link pageArrow"><span class="material-symbols-outlined">chevron_left</span></button>
      {:else}
          <button title="forrige side" class="link pageArrow" on:click={previousPage}><span class="material-symbols-outlined">chevron_left</span></button>
      {/if}
      {#each getPaginationArray(currentPage, numberOfPages) as pageNumber}
        {#if pageNumber === '...'}
            <button disabled class="link currentPage">{pageNumber}</button>
        {:else if currentPage === pageNumber}
            <button disabled class="link currentPage">{pageNumber+1}</button>
        {:else}
            <button class="link{currentPage === pageNumber ? ' currentPage' : ''}" on:click={() => {gotoPage(pageNumber)}}>{pageNumber+1}</button> <!--må muligens sende inn funksjon her og-->
        {/if}
      {/each}
      {#if currentPage === numberOfPages-1}
        <button disabled title="neste side" class="link pageArrow"><span class="material-symbols-outlined">chevron_right</span></button>
      {:else}
        <button title="neste side" class="link pageArrow" on:click={nextPage}><span class="material-symbols-outlined">chevron_right</span></button>
      {/if}
    </div>
    {#if currentPage === numberOfPages-1} <!--last page-->
      <div class="countInfo">Viser {elementsPerPage > numberOfElements ? numberOfElements : `${(elementsPerPage * currentPage) + 1}-${numberOfElements}`} av {numberOfElements} {elementName}</div>
    {:else}
      <div class="countInfo">Viser {elementsPerPage > numberOfElements ? numberOfElements : `${(elementsPerPage * currentPage) + 1}-${elementsPerPage * (currentPage + 1)}` } av {numberOfElements} {elementName}</div>
    {/if}
</div>

<style>
  .pageRow {
			display: flex;
			justify-content: space-between;
	}
	.pageNumbers {
			display: flex;
			gap: 0.5rem;
	}
	.currentPage {
			font-weight: bold;
			color: var(--font-color) !important ;
			text-decoration: none;
	}
	.pageArrow {
			text-decoration: none;
	}

</style>