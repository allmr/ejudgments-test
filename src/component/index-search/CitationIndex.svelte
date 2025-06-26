<script>
  import { push } from "svelte-spa-router";
  import { judgementResult, totalRecords, query } from "../../model/store";
  import { citationElasticSearch } from "../../utils/CitationSearchModule.svelte";
  import { failure } from "../../utils/Toast";

  $: inputYear = "";
  $: inputVolume = "";
  $: inputPublication = "ALL MR";
  $: inputPage = "";

  let isloader = false;
  const volumes = [
    "ALL MR",
    "ALL MR (Cri)",
    "ALL SCR",
    "ALL SCR (Cri)",
    "ALL MR (SUPREME COURT)",
    "ALL MR (Cri) (SUPREME COURT)",
    "ALL MR (JOURNAL)",
    "ALL MR (Cri) (JOURNAL)",
    "ALL SCR (ONLINE)",
    "ALLMR ONLINE",
    "NearLaw (BombayHC) Online",
    "NearLaw (BombayHC Goa) Online",
    "NearLaw (BombayHC Nagpur) Online",
    "NearLaw (BombayHC Aurangabad) Online",
    "NearLaw (Mumbai HC)",
    "NearLaw (Mumbai HC) (Cri)",
    "NearLaw (Mumbai HC) (SUPREME COURT)",
    "NearLaw (Mumbai HC) (Cri) (SUPREME COURT)",
  ];

  //Citation search history to be pushed with other search index histories

  // const storeHistory = (esQuery)=>{
  //     let hData = {
  //     time : Date.now(),
  //     view : [`Citation : ${q}`],
  //     query: esQuery
  //   };
  //   history_db
  //     .post(hData)
  //     .then(function(result) {
  //       console.log(result);
  //     })
  //     .catch(function(err) {
  //       console.log(err);
  //     });
  // }

  const searchCitation = async () => {
    isloader = true;
    let q =
      inputVolume === "" || inputVolume === null
        ? inputYear + " " + inputPublication + " " + inputPage
        : inputYear +
          "(" +
          inputVolume +
          ") " +
          inputPublication +
          " " +
          inputPage;

    let result = await citationElasticSearch(q, true);
    if (result === false) {
      failure("No Results found");
      isloader = false;
    } else {
      $query = JSON.parse(result.config.data);
      $judgementResult = result.data.hits.hits;
      $totalRecords = result.data.hits.total.value;
      localStorage.setItem("sort", "latest");
      localStorage.setItem("filter", "all");
      localStorage.setItem("citationClick", "false");
      localStorage.setItem("casesCitedClick", "false");
      localStorage.setItem("statusCheckerClick", "false");
      localStorage.setItem("statusCitationClick", "false");
      localStorage.setItem("indexValue", 0);
      localStorage.setItem("totalRecords", $totalRecords);
      isloader = false;
      push("/judgement");
    }
  };
</script>

{#if isloader}
  <div class="loader" />
{/if}
<div class="w-full max-w-xs">
  <div class="bg-white shadow-md rounded px-4 pt-3 pb-4 mb-2 overflow-hidden">
    <div class="mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2" for="year">
        Year
      </label>
      <input
        class="shadow appearance-none border rounded w-full py-2 px-3
        text-gray-700 leading-tight focus:border-black"
        id="year"
        type="number"
        min="1950"
        max="2020"
        placeholder="Year"
        name="year"
        bind:value={inputYear}
      />
    </div>
    <div class="mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2">
        Volume No
      </label>
      <input
        class="shadow appearance-none border border rounded w-full py-2 px-3
        text-gray-700 mb-2 leading-tight focus:border-black"
        type="number"
        min="1"
        max="10"
        name="volume"
        bind:value={inputVolume}
      />
    </div>
    <div class="mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2">
        Publication
      </label>
      <select
        class="shadow appearance-none border border rounded w-full py-2 px-3
        text-gray-700 mb-2 leading-tight focus:border-black"
        id="grid-state"
        bind:value={inputPublication}
      >
        {#each volumes as volume}
          <option value={volume}>{volume}</option>
        {/each}
      </select>
    </div>
    <div class="mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2">Page No</label>
      <input
        class="shadow appearance-none border rounded w-full py-2 px-3
        text-gray-700 leading-tight focus:border-black"
        type="number"
        min="1"
        max="10000"
        name="pageno"
        bind:value={inputPage}
      />
    </div>
    <button
      class="primary-btn font-bold py-2 px-4 float-right rounded inline-flex
      items-center"
      on:click={searchCitation}
    >
      Search
    </button>
  </div>
</div>

<style>
  select {
    background-color: white !important;
    border: 1px solid #9e9e9e;
  }
  * {
    outline: none;
  }
  input {
    border: 1px solid #9e9e9e;
  }
</style>
