<script>
  import YearsComponent from "./YearsComponent.svelte";
  import CourtComponent from "./CourtComponent.svelte";
  import { citationSearch } from "../model/flexConfig.js";
  import { citationElasticSearch } from "../utils/CitationSearchModule.svelte";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  export let year;

  let isOpen;

  // CIVIL BUILD
  // let journalsTopTwo = ["ALLMR"];
  // let journals = ["ALLSCR", "ALLMR"];

  // CRIMINAL BUILD
  // let journalsTopTwo = ["ALLMR(Cri)"];
  // let journalsTopThree = ["ALLSCR", "ALLMR(Cri)"];
  // let journals = ["ALLSCR(Cri)", "ALLMR(Cri)"];

  let isloader = false;
  let mainCitations = [];
  let judgement = "";
  let citations = [];
  let courts = ["Supreme Court", "Mumbai High Court"];
  let courtsHC = ["Mumbai High Court"];
let isOpenToggleCourt;
  async function handleToggleData(event) {
    isOpen = event.detail.isOpen;
    if (year <= 1996) citations = await getJournalCitationsByYear();
  }

  async function getJournalCitationsByYear() {
    mainCitations = await searchCitationName("or");
    return mainCitations;
  }

  const searchCitationName = async () => {
    let result;
    let query = [];
    query.push({
      query: `${year}`,
      field: "Citation",
      bool: "and",
      sort: "Citation",
    });

    result = await citationSearch.search(query);
    let reg = new RegExp(`^${year}`, "gm");
    result = result.filter((e) => {
      if (reg.test(e.Citation)) {
        return e;
      }
    });
    return result;
  };

  const searchCitation = async () => {
    isloader = true;
    let q = event.target.innerHTML;
    judgement = await citationElasticSearch(q);
    if (judgement != false) {
      judgement = JSON.stringify(judgement.data.hits.hits[0]._source);
      dispatch("citationData", {
        judgementData: judgement,
        items: citations,
      });
      isloader = false;
    } else {
      isloader = false;
      failure("No Result available please update");
    }
  };

  const handleToggleJournal = (event) => {
    isOpenToggleCourt = event.detail.isOpen;
    judgement = event.detail.judgementData;
    citations = event.detail.items;
    dispatch("citationData", {
      isOpen: isOpen,
      judgementData: judgement,
      items: citations,
    });
  };
</script>

{#if isloader}
  <div class="loader" />
{/if}
<YearsComponent {year} on:toggledata={handleToggleData} />
<!-- {#if year >= 2016}
  {#if isOpen}
    {#each journals as journal}
      <JournalComponent
        {journal}
        {year}
        on:citationData={handleToggleJournal}
      />
    {/each}
  {/if}
{:else if year >= 2007 && year <= 2015}
  {#if isOpen}
    {#each journalsTopThree as journal}
      <JournalComponent
        {journal}
        {year}
        on:citationData={handleToggleJournal}
      />
    {/each}
  {/if}
{:else if year >= 1997 && year <= 2006}
  {#if isOpen}
    {#each journalsTopTwo as journal}
      <JournalComponent
        {journal}
        {year}
        on:citationData={handleToggleJournal}
      />
    {/each}
  {/if}
{:else if year <= 1996}
  {#if isOpen}
    {#each citations as citation}
      <div
        id={citation.id}
        class="p-2 cursor-pointer ml-5"
        on:click={searchCitation}
      >
        {citation.Citation}
      </div>
      <hr />
    {/each}
  {/if}
{/if} -->
<!-- {#if year >= 2007}
  {#if isOpen}
    {#each journals as journal}
      <JournalComponent
        {journal}
        {year}
        on:citationData={handleToggleJournal}
      />
    {/each}
  {/if}
{:else if year >= 1997 && year <= 2006}
  {#if isOpen}
    {#each journalsTopTwo as journal}
      <JournalComponent
        {journal}
        {year}
        on:citationData={handleToggleJournal}
      />
    {/each}
  {/if}
{:else if year <= 1996}
  {#if isOpen}
    {#each citations as citation}
      <div
        id={citation.id}
        class="p-2 cursor-pointer ml-5"
        on:click={searchCitation}
      >
        {citation.Citation}
      </div>
      <hr />
    {/each}
  {/if}
{/if} -->

{#if year >= 2007}
  {#if isOpen}
    {#each courts as court}
      <CourtComponent {court} {year} on:citationData={handleToggleJournal} />
    {/each}
  {/if}
{:else if year >= 1997 && year <= 2006}
  {#if isOpen}
    {#each courtsHC as court}
      <CourtComponent {court} {year} on:citationData={handleToggleJournal} />
    {/each}
  {/if}
{:else if year <= 1996}
  {#if isOpen}
    {#each citations as citation}
      <div
        id={citation.id}
        class="p-2 cursor-pointer ml-5"
        on:click={searchCitation}
      >
        {citation.Citation}
      </div>
      <hr />
    {/each}
  {/if}
{/if}

<style>
</style>
