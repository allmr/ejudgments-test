<script>
  import { createEventDispatcher } from "svelte";
  import { push } from "svelte-spa-router";
  import { history_db } from "../../model/store";
  import axios from "axios";
  import { failure } from "../../utils/Toast";
  import {
    baseUrl,
    judgementResult,
    fullJudgementResult,
    totalRecords,
    query,
    USERNAME,
    PASSWORD,
  } from "../../model/store.js";

  const dispatch = createEventDispatcher();
  export let freeTextValue = ""; //its a prop comes from outside the component
  let isloader = false;
  let q = "";
  let hData = {}; // History Data
  hData.view = [];
  let searchData = [];
  let cccheck = true;
  async function searchFreeText() {
    searchData = [];
    isloader = true;
    q = `${freeTextValue}`;
    if (cccheck) {
      q = `\"${q}\"`;
    }
    hData.view.push(`Cases Cited : ${q}`);
    searchData.push({
      simple_query_string: {
        query: `${q}`,
        fields: ["cases_cited", "cases_citated"],
        default_operator: "or",
      },
    });
    let data = {
      query: {
        bool: {
          must: searchData,
        },
      },
    };
    data.from = 0;
    data.size = 100;

    data.sort = [
      {
        doj_sort: { order: "desc" },
      },
    ];

    let result = await axios({
      url: `${baseUrl}/judgement/nearlaw/_search`,
      auth: {
        username: USERNAME,
        password: PASSWORD,
      },
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: data,
    });
    //Citation search history to be pushed with other search index histories
    highlight(freeTextValue);
    $query = data;
    $totalRecords = result.data.hits.total.value;
    $judgementResult = result.data.hits.hits;
    $fullJudgementResult = result.data.hits.hits;
    localStorage.setItem("totalRecords", $totalRecords);
    localStorage.setItem("sort", "latest");
    localStorage.setItem("filter", "all");
    localStorage.setItem("citationClick", "false");
    localStorage.setItem("casesCitedClick", "false");
    localStorage.setItem("statusCheckerClick", "false");
    localStorage.setItem("statusCitationClick", "false");
    localStorage.setItem("indexValue", 0);
    hData.time = Date.now();
    hData.query = data;
    history_db
      .post(hData)
      .then(function (result) {})
      .catch(function (err) {});
    if ($totalRecords === 0) {
      failure("No results Found");
      isloader = false;
      return;
    }
    isloader = false;
    push("/judgement");
  }
  const highlight = (casesCited) => {
    localStorage.setItem("highlight", casesCited);
  };
</script>

{#if isloader}
  <div class="loader" />
{/if}
<div class="w-full max-w-xs">
  <div class="bg-white shadow-md rounded px-4 pt-3 pb-4 mb-2 overflow-hidden">
    <div class="mb-4">
      <div class="flex flex-row w-full mb-2 md:mb-0 justify-between">
        <label class="block text-gray-700 text-sm font-bold mb-2">
          Cases Cited Search
        </label>
        <div>
          <input class="leading-tight" type="checkbox" bind:checked={cccheck} />
          <span class="text-sm">Exact</span>
        </div>
      </div>
      <input
        class="shadow appearance-none border rounded w-full py-2 px-3
        text-gray-700 leading-tight focus:border-black"
        type="text"
        bind:value={freeTextValue}
      />
    </div>
    <button
      class="primary-btn text-gray-800 font-bold py-2 px-4 rounded float-right
      inline-flex items-center"
      on:click={searchFreeText}
    >
      Search
    </button>
  </div>
</div>

<style>
  * {
    outline: none;
  }
  input {
    border: 1px solid #9e9e9e;
  }
</style>
