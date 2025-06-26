<script>
  import { createEventDispatcher } from "svelte";
  import JournalComponent from "./JournalComponent.svelte";
  const dispatch = createEventDispatcher();
  export let court;
  export let year;

  // AIO BUILD
  let journalSCTopThree = ["ALLSCR"];
  let journalHCTopThree = ["ALLMR", "ALLMR(Cri)"];

  let journalHCTopTwo = ["ALLMR", "ALLMR(Cri)"];

  let journalSC = ["ALLSCR", "ALLSCR(Cri)"];
  let journalHC = ["ALLMR", "ALLMR(Cri)"];

  // CIVIL BUILD
  // let journalSC = ["ALLSCR"];
  // let journalHC = ["ALLMR"];

  // CRIMINAL BUILD
  // let journalSC = ["ALLSCR(Cri)"];
  // let journalHC = ["ALLMR(Cri)"];

  let citations = [];

  let isOpen = false;
  let judgement = "";
  let isOpenToggleCourt;
  function toggle() {
    isOpen = !isOpen;
  }

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

<button on:click={toggle} aria-expanded={isOpen}>
  <span class="inline-block">
    <svg
      width="20"
      height="20"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d="M9 5l7 7-7 7" />
    </svg>
  </span>

  <span class="inline-block">{court}</span>
</button>

{#if year >= 2016}
  {#if isOpen && court == "Supreme Court"}
    {#each journalSC as journal}
      <JournalComponent
        {journal}
        {year}
        on:citationData={handleToggleJournal}
      />
    {/each}
  {:else if isOpen && court == "Mumbai High Court"}
    {#each journalHC as journal}
      <JournalComponent
        {journal}
        {year}
        on:citationData={handleToggleJournal}
      />
    {/each}
  {/if}
{:else if year >= 2007 && year <= 2015}
  {#if isOpen && court == "Supreme Court"}
    {#each journalSCTopThree as journal}
      <JournalComponent
        {journal}
        {year}
        on:citationData={handleToggleJournal}
      />
    {/each}
  {:else if isOpen && court == "Mumbai High Court"}
    {#each journalHCTopThree as journal}
      <JournalComponent
        {journal}
        {year}
        on:citationData={handleToggleJournal}
      />
    {/each}
  {/if}
{:else if year >= 1997 && year <= 2006}
  {#if isOpen && court == "Mumbai High Court"}
    {#each journalHCTopTwo as journal}
      <JournalComponent
        {journal}
        {year}
        on:citationData={handleToggleJournal}
      />
    {/each}
  {/if}
{/if}

<!-- {#if year >= 2007}
  {#if isOpen && court == "Supreme Court"}
    {#each journalSC as journal}
      <JournalComponent
        {journal}
        {year}
        on:citationData={handleToggleJournal}
      />
    {/each}
  {:else if isOpen && court == "Mumbai High Court"}
    {#each journalHC as journal}
      <JournalComponent
        {journal}
        {year}
        on:citationData={handleToggleJournal}
      />
    {/each}
  {/if}
{:else if year >= 1997 && year <= 2006}
  {#if isOpen && court == "Mumbai High Court"}
    {#each journalHC as journal}
      <JournalComponent
        {journal}
        {year}
        on:citationData={handleToggleJournal}
      />
    {/each}
  {/if}
{/if} -->

<!-- {#if year >= 2007}
  {#if isOpen && court == "Supreme Court"}
    {#each journalSC as journal}
      <JournalComponent
        {journal}
        {year}
        on:citationData={handleToggleJournal}
      />
    {/each}
  {:else if isOpen && court == "Mumbai High Court"}
    {#each journalHC as journal}
      <JournalComponent
        {journal}
        {year}
        on:citationData={handleToggleJournal}
      />
    {/each}
  {/if}
{:else if year >= 1997 && year <= 2006}
  {#if isOpen && court == "Mumbai High Court"}
    {#each journalHC as journal}
      <JournalComponent
        {journal}
        {year}
        on:citationData={handleToggleJournal}
      />
    {/each}
  {/if}
{/if} -->
<style>
  button {
    border: none;
    outline: 0;
    background: none;
    display: block;
    color: inherit;
    cursor: pointer;
    margin-left: 0.5em;
    font-size: 1.4em;
  }

  svg {
    transition: transform 0.2s ease-in;
    padding: auto 0 !important;
  }

  [aria-expanded="true"] svg {
    transform: rotate(0.25turn);
  }
</style>
