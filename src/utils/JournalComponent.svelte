<script>
  import { createEventDispatcher } from "svelte";
  import { citationElasticSearch } from "../utils/CitationSearchModule.svelte";
  import * as citationMapMonth from "../../citation_map.json";
  import MonthComponent from "./MonthComponent.svelte";
  import { failure } from "../utils/Toast";
  import axios from "axios";
  import { baseUrl, USERNAME, PASSWORD } from "../model/store.js";
  const dispatch = createEventDispatcher();
  export let journal;
  export let year;

  let isOpen = false;
  let isloader = false;
  let judgement = "";
  let months = [];
  let citations = [];
  let journalCitations = [];

  let journalsArray = ["ALLSCR(Cri)", "ALLMR(Cri)", "ALLMR", "ALLSCR"];
  // let journalsArray = ["ALLMR", "ALLSCR"];
  // let journalsArray = ["ALLSCR(Cri)", "ALLMR(Cri)"];

  let journalcitationsarray = [];
  let qu = [];
  let volumes = [];
  let qString = [];
  let qstr = "";
  let finalQuery = "";
  let newJournalQuery = "";
  let querylast = "";
  let journalData = [];
  let finaljournalCitations = [];
  let isOpenToggleMonth;

  async function toggle() {
    isOpen = !isOpen;
    let nodeName = event.srcElement.nodeName;
    let q;
    if (nodeName === "svg")
      q = event.target.parentNode.nextElementSibling.innerHTML;
    else if (nodeName === "path")
      q = event.target.parentNode.parentNode.nextElementSibling.innerHTML;
    else if (nodeName == "SPAN") q = event.target.innerHTML;
    else if (nodeName == "BUTTON") q = event.target.innerText.trim();
    if (year == 2025 || year == 2024 || year == 2023 || year == 2022 || year == 2021 || year == 2020) {
      months = citationMapMonth["default"][year][journalsArray.indexOf(q)][q];
    } else {
      citations = [];
      citations = await getJournalCitations(q);
      citations.sort((a, b) =>
        a.Citation.localeCompare(b.Citation, undefined, { numeric: true })
      );
      console.log("Citations", citations);
    }
    dispatch("toggledata", {
      isOpen: isOpen,
    });
  }

  async function getJournalCitations(q) {
    if (q == "ALLSCR") {
      newJournalQuery = "ALL SCR";
    } else if (q == "ALLSCR(Cri)") {
      newJournalQuery = "ALL SCR (Cri)";
    } else if (q == "ALLMR") {
      newJournalQuery = "ALL MR";
    } else if (q == "ALLMR(Cri)") {
      newJournalQuery = "ALL MR (Cri)";
    }
    journalCitations = await searchCitationName(newJournalQuery);

    return journalCitations;
  }

  function makeQueryStringForALLMR(journalQuery, year) {
    volumes = ["1", "2", "3", "4", "5", "6", "7"];
    qString = [];

    volumes.forEach((element) => {
      qstr = `\"${year}(${element}) ${journalQuery}\"`;
      qString.push(qstr);
    });
    finalQuery = qString.join("|");
    return finalQuery;
  }

  const searchCitationName = async (journalQuery) => {
    if (journalQuery == "ALL MR") {
      querylast = makeQueryStringForALLMR(journalQuery, year);
      qu = [
        {
          simple_query_string: {
            query: `${querylast}`,
            fields: ["Citation"],
            default_operator: "and",
          },
        },
      ];
    } else {
      qu = [
        {
          simple_query_string: {
            query: `\"${year} ${journalQuery}\"`,
            fields: ["Citation"],
            default_operator: "and",
          },
        },
      ];
    }

    let mustNotParams = [
      {
        match: {
          Citation: "NearLaw",
        },
      },
      {
        match: {
          Citation: "Online",
        },
      },
    ];

    if (journalQuery.includes("Cri") == false) {
      mustNotParams.push({
        match: {
          Citation: "(Cri)",
        },
      });
    }

    let data = {
      query: {
        bool: {
          must: qu,
          must_not: mustNotParams,
        },
      },
    };
    data.from = 0;
    data.size = 10000;

    let result = await axios({
      url: `${baseUrl}/judgement/nearlaw/_search?filter_path=hits.hits._source.Citation`,
      auth: {
        username: USERNAME,
        password: PASSWORD,
      },
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: data,
    });

    journalData = result.data.hits.hits;
    finaljournalCitations = makeArray(journalData);
    return finaljournalCitations;
  };

  function makeArray(journalData) {
    journalcitationsarray = [];
    journalData.forEach((element) => {
      journalcitationsarray.push(element._source);
    });
    return journalcitationsarray;
  }

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

  const handleToggleDataMonth = (event) => {
    isOpenToggleMonth = event.detail.isOpen;
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

  <span class="inline-block" id="journal">{journal}</span>
</button>

{#if isOpen}
  {#if year == 2020 || year == 2021 || year == 2022 || year == 2023 || year == 2024 || year == 2025}
    {#each months as month}
      <MonthComponent
        {year}
        {journal}
        {month}
        on:citationData={handleToggleDataMonth}
      />
    {/each}
  {:else}
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
  button {
    border: none;
    outline: 0;
    background: none;
    display: block;
    color: inherit;
    cursor: pointer;
    margin-left: 1em;
    font-size: 1.3em;
  }

  svg {
    transition: transform 0.2s ease-in;
    padding: auto 0 !important;
  }

  [aria-expanded="true"] svg {
    transform: rotate(0.25turn);
  }
</style>
