<script>
  import { slide } from "svelte/transition";
  import { createEventDispatcher } from "svelte";
  import JournalComponent from "./JournalComponent.svelte";
  import * as citationMap from "../../citation_map_month.json";
  import { citationElasticSearch } from "../utils/CitationSearchModule.svelte";
  import { SvelteToast } from "@zerodevx/svelte-toast";
  import { success, failure } from "../utils/Toast";
  const dispatch = createEventDispatcher();
  export let year;
  export let journal;
  export let month;

  let isOpen = false;
  let isloader = false;
  let judgement = "";
  let mainCitations = [];
  let citations = [];
  let journalsArray = ["ALLSCR(Cri)", "ALLMR(Cri)", "ALLMR", "ALLSCR"];
  // let journalsArray = ["ALLMR", "ALLSCR"];
  // let journalsArray = ["ALLSCR(Cri)", "ALLMR(Cri)"];

  function toggle() {
    isOpen = !isOpen;
    let nodeName = event.srcElement.nodeName;
    let q;
    if (nodeName === "svg")
      q = event.target.parentNode.nextElementSibling.innerHTML;
    else if (nodeName === "path")
      q = event.target.parentNode.parentNode.nextElementSibling.innerHTML;
    else if (nodeName == "SPAN") q = event.target.innerHTML;
    else if (nodeName == "BUTTON") q = event.target.innerText.trim();

    citations = [];
    citations = getJournalCitations(q, year, journal);
    dispatch("toggledata", {
      isOpen: isOpen,
    });
  }

  const searchCitationName = async (operator) => {
    let result;
    let query = [
      {
        query: `${year} ALL SCR`,
        field: "Citation",
        bool: operator,
        sort: "Citation",
      },
    ];
    if (operator === "not") {
      query.push({
        query: `${year}`,
        field: "Citation",
        bool: "and",
        sort: "Citation",
      });
    }
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

  function getJournalCitations(q, year, journal) {
    mainCitations =
      citationMap["default"][year][journalsArray.indexOf(journal)][journal][0][
        q
      ];
    return mainCitations;
  }
</script>

{#if isloader}
  <div class="loader" />
{/if}
<button on:click={toggle} aria-expanded={isOpen} class="">
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

  <span class="inline-block" id="month">{month}</span>
</button>

{#if isOpen}
  {#each citations as citation}
    <div class="p-2 cursor-pointer ml-10" on:click={searchCitation}>
      {citation.Citation}
    </div>
    <hr />
  {/each}
{/if}

<style>
  button {
    border: none;
    outline: 0;
    background: none;
    display: block;
    color: inherit;
    cursor: pointer;
    margin-left: 2em;
    font-size: 1em;
  }

  svg {
    transition: transform 0.2s ease-in;
    padding: auto 0 !important;
  }

  [aria-expanded="true"] svg {
    transform: rotate(0.25turn);
  }
</style>
