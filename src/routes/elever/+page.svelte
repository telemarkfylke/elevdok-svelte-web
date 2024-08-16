<script>
	import { clickOutside } from '$lib/helpers/click-outside'
	import { goto } from '$app/navigation'

	/** @type {import('./$types').PageData} */
	export let data

	let studentsPerPage = 10
	let page = 0 // zero-indexed
	let numberOfPages = Math.ceil(data.students.length / studentsPerPage)
	let students = data.students
	let originalStudents = JSON.parse(JSON.stringify(data.students))
	let studentMenus = {}
	students.forEach(student => {
		studentMenus[student.elevnummer] = false
	})
	let searchValue

	const search = (searchValue) => {
		const filterFunc = (student) => {
			const sv = searchValue.toLowerCase()
			return (student.navn.toLowerCase().startsWith(sv) || student.etternavn.toLowerCase().startsWith(sv) || student.skoler.some(school => school.klasser.some(group => group.navn.toLowerCase().includes(sv))))
		}
		students = originalStudents.filter(filterFunc)
    page = 0
    numberOfPages = Math.ceil(students.length / studentsPerPage)
	}

	const getPaginationArray = (currentPage, numberOfPages) => {
		const maxPageNumbers = 11 // Use odd numbers to have current in the middle
		const allPages = Array.from(Array(numberOfPages).keys())
		if (numberOfPages <= maxPageNumbers) return allPages
		const createWindowLimit = Math.ceil(maxPageNumbers / 2) // If max 11 => 5 allowed neighbouring numbers, always want 11 total
		if (currentPage < createWindowLimit) return [...allPages.slice(0, maxPageNumbers-2), '...', allPages.length-1]
		if (currentPage > (allPages.length - 1 - createWindowLimit)) return [0, '...', ...allPages.slice(allPages.length - maxPageNumbers + 2, allPages.length)]
		const neighnoursToTheLeft = (maxPageNumbers - 4 - 1) / 2 // One for each of the 0, '...', '...', '', allPages.length-1 below, and one for the current page itself, divided by two (neighnours on each side)
		const neighnoursToTheRight = neighnoursToTheLeft + 1 // slice not including last index
		return [0, '...', ...allPages.slice(currentPage - neighnoursToTheLeft, currentPage + neighnoursToTheRight), '...', allPages.length-1]
	}

</script>

<h2>Dine elever</h2>
<div class="icon-input" style="width: 16rem;">
	<span class="material-symbols-outlined">search</span>
	<input type="text" bind:value={searchValue} on:input={() => { search(searchValue) }} placeholder="Søk etter elev eller klasse" />
</div>
<div class="studentList">
	<div class="studentRow header">
		<div class="studentInfo">Navn</div>
		<div>Skole / Klasse</div>
	</div>
	{#each students.slice(page * studentsPerPage, (page * studentsPerPage) + studentsPerPage) as student}
		<div class=studentRow>
			<div class="studentInfo">
				{#if student.skoler.some(school => school.kontaktlarer)}
					<div class="contactTeacher" title="Du er kontaktlærer for denne eleven"><strong>Kontaktlærer</strong></div>
				{:else if student.skoler.some(school => school.iop)}
					<div class="contactTeacher" title="Du har IOP-tilgang for denne eleven"><strong>IOP</strong></div>
				{/if}
				<div class="studentName">
					<a href="/elever/{student.feidenavnPrefix}">{student.navn}</a>
				</div>
				<div class="studentId">{student.feidenavnPrefix}</div>
			</div>
			<div>
				{#each student.skoler as school}
					{#each school.klasser as group}
						<div class="classGroup">
							<a href="/klasser/{group.systemId}">{`${school.kortkortnavn}:${group.navn}`}</a>
						</div>
					{/each}
				{/each}
			</div>
		</div>
	{/each}
    <div class="pageRow">
      <div>Side {page+1} av {numberOfPages}</div>
        <div class="pageNumbers">
          {#if page === 0}
            <button disabled title="forrige side" class="link pageArrow"><span class="material-symbols-outlined">chevron_left</span></button>
          {:else}
              <button title="forrige side" class="link pageArrow" on:click={() => page--}><span class="material-symbols-outlined">chevron_left</span></button>
          {/if}
          {#each getPaginationArray(page, numberOfPages) as pageNumber}
						{#if pageNumber === '...'}
								<button disabled class="link currentPage">{pageNumber}</button>
						{:else if page === pageNumber}
								<button disabled class="link currentPage">{pageNumber+1}</button>
						{:else}
								<button class="link{page === pageNumber ? ' currentPage' : ''}" on:click={() => page = pageNumber}>{pageNumber+1}</button>
						{/if}
          {/each}
					{#if page === numberOfPages-1}
						<button disabled title="neste side" class="link pageArrow"><span class="material-symbols-outlined">chevron_right</span></button>
					{:else}
						<button title="neste side" class="link pageArrow" on:click={() => page++}><span class="material-symbols-outlined">chevron_right</span></button>
					{/if}
      	</div>
      <div class="countInfo">Viser {studentsPerPage > students.length ? students.length : studentsPerPage} av {students.length} elever</div>
    </div>
</div>

<style>
	.studentRow {
		display: flex;
		align-items: center;
		padding: 1rem 2rem;
	}
	.studentRow.header {
		padding: 1rem 2rem 0rem 2rem;
	}
	.studentInfo {
		max-width: 11rem;
		flex-grow: 1;
	}
	.contactTeacher {
		font-size: var(--font-size-extra-small);
	}
	.studentId {
		font-size: var(--font-size-small);
	}
	.classGroup {
		font-size: var(--font-size-small);
	}
	.studentRow:nth-child(even) {
		background-color: var(--primary-color-10);
	}
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