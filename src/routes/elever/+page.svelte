<script>
	import { clickOutside } from '$lib/helpers/click-outside'
	import { goto } from '$app/navigation'
  import Pagination from '$lib/components/Pagination.svelte';

	/** @type {import('./$types').PageData} */
	export let data

	let studentsPerPage = 10
	let currentPage = 0 // zero-indexed
	let students = data.students
	let originalStudents = JSON.parse(JSON.stringify(data.students))
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
		const filterFunc = (student) => {
			const sv = searchValue.toLowerCase()
			return (student.navn.toLowerCase().startsWith(sv) || student.etternavn.toLowerCase().startsWith(sv) || student.skoler.some(school => school.klasser.some(group => group.navn.toLowerCase().includes(sv))))
		}
		students = originalStudents.filter(filterFunc)
    currentPage = 0
	}
</script>

<h2>Dine elever</h2>
<div class="icon-input" style="width: 16rem;">
	<span class="material-symbols-outlined">search</span>
	<input type="text" bind:value={searchValue} on:input={() => { search(searchValue) }} placeholder="Søk etter elev eller klasse" />
</div>
<div class="studentList">
	{#if originalStudents.length === 0}
		<br />
		Du har ikke tilgang på noen elever 🤷‍♂️
	{:else if students.length === 0}
		<br />	
		Fant ingen elever med søket 🤷‍♂️
	{:else}
		<div class="studentRow header">
			<div class="studentInfo">Navn</div>
			<div>Skole / Klasse</div>
		</div>
		{#each students.slice(currentPage * studentsPerPage, (currentPage * studentsPerPage) + studentsPerPage) as student}
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
								<div>{`${school.kortkortnavn}:${group.navn}`}</div>
								<!--<a href="/klasser/{group.systemId}">{`${school.kortkortnavn}:${group.navn}`}</a>-->
							</div>
						{/each}
					{/each}
				</div>
			</div>
		{/each}
		<Pagination {currentPage} elementName={'elever'} elementsPerPage={studentsPerPage} maxPageNumbers={11} {gotoPage} {nextPage} {previousPage} numberOfElements={students.length} />
	{/if}
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
</style>