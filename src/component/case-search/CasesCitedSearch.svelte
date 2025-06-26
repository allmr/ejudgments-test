<script>
  import { casesCitedDataSearch } from "../../model/flexConfig";
  import { createEventDispatcher } from "svelte";
  import Select from "svelte-select";
  import {
    casesCitedData,
    casesCitedHistory,
    casesCitedHighlight,
  } from "../../model/store.js";

  let casesCitedValue = "";
  let casesCitedArray = [];
  let cccheck = true;
  let citation = "";
  let str = "";

  const dispatch = createEventDispatcher();
  const optionIdentifier = "id";
  const getOptionLabel = (option) => option.citation;
  const getSelectionLabel = (option) => {
    casesCitedValue = option;
    citation = casesCitedValue.citation;
    handleChange();
    return option.citation;
  };

  const searchCasesCited = async (ccv) => {
    let result = [];
    if (ccv.length > 3) {
      result = await casesCitedDataSearch.search({
        sort: "citation",
        query: ccv,
        field: "citation",
      });
    }
    return result;
  };

  function addCasesCitedToSearch(casesCitedValue) {
    casesCitedArray = [];
    if (casesCitedValue === null || casesCitedValue === "undefined") {
      return false;
    }

    casesCitedArray.push(casesCitedValue);
    str = `${casesCitedArray.join(",")}`;

    let searchData = _createSearchData();
    $casesCitedHistory = [...$casesCitedHistory, ...history.view];
    $casesCitedData = [...searchData, ...$casesCitedData];
    $casesCitedHighlight = $casesCitedHighlight + "|" + str;

    dispatch("casesCitedData", {
      casesCitedData: searchData,
      history: history.view,
      highlight: str,
    });
  }

  function handleChange() {
    if (cccheck) {
      casesCitedValue = `\"${citation}\"`;
    } else casesCitedValue = citation;
    addCasesCitedToSearch(casesCitedValue);
  }

  function _createSearchData() {
    let result = [];

    history.view = [];
    history.view.push(`Cases Cited : ${casesCitedArray.join(",")}`);

    let q = casesCitedArray;
    result.push({
      simple_query_string: {
        query: `${q.join(" ")}`,
        fields: ["cases_cited", "cases_citated"],
        default_operator: "and",
      },
    });

    return result;
  }
</script>

<div class="-mx-3 px-3">
  <div class="flex flex-row w-full mb-1 justify-between">
    <label class="block uppercase tracking-wide text-xl font-bold">
      Cases Cited
    </label>
    <div>
      <input
        class="leading-tight"
        type="checkbox"
        bind:checked={cccheck}
        on:change={handleChange}
      />
      <span class="text-sm">Exact</span>
    </div>
  </div>
  <div class="w-full mb-2 -py-px  select">
    <Select
      loadOptions={searchCasesCited}
      {optionIdentifier}
      {getSelectionLabel}
      {getOptionLabel}
      placeholder="Search for Citation in Cases Cited"
      inputStyles="font-size: 1em"
    />
  </div>
</div>

<style type="text/css">
  * {
    box-sizing: border-box;
  }
  .text-xl {
    font-size: 0.8rem;
  }
  .select {
    font-size: 1em;
    --border: 1px solid #9e9e9e;
  }

  .select:focus {
    --border: 1px solid black;
  }
</style>
