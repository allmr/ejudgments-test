<script>
  import { citationSearch } from "../../model/flexConfig.js";
  import Select from "svelte-select";
  import { push } from "svelte-spa-router";
  import { citationElasticSearch } from "../../utils/CitationSearchModule.svelte";
  import { judgementResult, totalRecords, query } from "../../model/store";
  import { failure } from "../../utils/Toast";
  let q;
  let isloader = false;

  const optionIdentifier = "id";

  const getOptionLabel = (option) => option.Citation;

  const getSelectionLabel = (option) => {
    q = option.Citation;
    return option.Citation;
  };

  const searchCitationName = async (input) => {
    let result;
    result = await citationSearch.search({
      limit: 100,
      query: `${input}`,
      field: "Citation",
    });
    result.sort((a, b) =>
      a.Citation.localeCompare(b.Citation, undefined, { numeric: true })
    );
    return result;
  };

  const searchCitation = async () => {
    isloader = true;
    let result = await citationElasticSearch(q, true);
    if (result) {
      $judgementResult = result.data.hits.hits;
      $totalRecords = result.data.hits.total.value;
      $query = JSON.parse(result.config.data);
      localStorage.setItem("sort", "latest");
      localStorage.setItem("filter", "all");
      localStorage.setItem("citationClick", "false");
      localStorage.setItem("casesCitedClick", "false");
      localStorage.setItem("statusCheckerClick", "false");
      localStorage.setItem("statusCitationClick", "false");
      localStorage.setItem("indexValue", 0);
      localStorage.setItem("totalRecords", $totalRecords);
      push("/judgement");
      isloader = false;
      return result;
    } else {
      isloader = false;
      failure("Result not found!");
    }
  };
</script>

{#if isloader}
  <div class="loader" />
{/if}
<div class="w-full max-w-xs h-auto">
  <div
    class="bg-white shadow-md rounded px-4 pt-3 mb-2"
    style="padding-bottom: 3.5rem;"
  >
    <div class="mb-4">
      <Select
        loadOptions={searchCitationName}
        {optionIdentifier}
        {getSelectionLabel}
        {getOptionLabel}
      />
    </div>
    <button
      class="primary-btn text-gray-800 font-bold py-2 px-4 rounded float-right
      inline-flex items-center"
      on:click={searchCitation}
    >
      Search
    </button>
  </div>
</div>

<style>
</style>
