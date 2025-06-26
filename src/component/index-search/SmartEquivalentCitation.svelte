<script>
  import { equalCitationDataSearch } from "../../model/flexConfig.js";
  import Select from "svelte-select";
  import { push } from "svelte-spa-router";
  import {
    judgementResult,
    totalRecords,
    baseUrl,
    USERNAME,
    PASSWORD,
    query,
  } from "../../model/store";
  import { save } from "../../utils/historyModule.svelte";
  import { failure } from "../../utils/Toast";
  import axios from "axios";

  let q;
  let isloader = false;

  const optionIdentifier = "id";

  const getOptionLabel = (option) => option.view;

  const getSelectionLabel = (option) => {
    q = option.view;
    return option.view;
  };

  const dataSearch = async (input) => {
    let result;
    result = await equalCitationDataSearch.search({
      limit: 100,
      query: `${input}`,
      field: "view",
      sort: "view",
    });
    return result;
  };

  /*
    search Citation from elasticSearch
  */
  const searchCitation = async () => {
    isloader = true;
    let data = {
      from: 0,
      size: 15,
      query: {
        bool: {
          must: [
            {
              simple_query_string: {
                fields: ["equivalent_citation"],
                query: `"${q}"`,
              },
            },
          ],
        },
      },
    };

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

    if (result.data.hits.total.value !== 0) {
      save([`Equivalent Citation: ${q}`], data);
    }

    if (result.data.hits.total.value === 0) {
      failure("No results Found");
      isloader = false;
      return false;
      0;
    }
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
    return result;
  };
</script>

{#if isloader}
  <div class="loader" />
{/if}
<div class="w-full max-w-xs">
  <div
    class="bg-white shadow-md rounded px-4 pt-3 pb-4 mb-2"
    style="padding-bottom: 3.5rem;"
  >
    <div class="mb-4">
      <Select
        loadOptions={dataSearch}
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
  * {
    outline: none;
  }
</style>
