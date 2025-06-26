<script>
  import { partyNameDataSearch } from "../../model/flexConfig";
  import { createEventDispatcher } from "svelte";
  import Select from "svelte-select";
  import {
    partyNameData,
    partyNameHistory,
    partyNameHighlight,
  } from "../../model/store.js";

  let partyNameValue = "";
  let partyNameArray = [];
  let partyName = "";
  let str = "";

  const dispatch = createEventDispatcher();
  const optionIdentifier = "id";
  const getOptionLabel = (option) => option.partyName;
  const getSelectionLabel = (option) => {
    partyNameValue = option;
    partyName = partyNameValue.partyName;
    addPartyNameToSearch(partyName);
    return option.partyName;
  };

  const searchPartyName = async (pnv) => {
    let result = [];
    if (pnv.length > 5) {
      result = await partyNameDataSearch.search({
        sort: "partyName",
        query: pnv,
        field: "partyName",
      });
    }
    return result;
  };

  function addPartyNameToSearch(partyNameValue) {
    partyNameArray = [];
    if (partyNameValue === null || partyNameValue === "undefined") {
      return false;
    }
    partyNameValue = `\"${partyNameValue}\"`;
    partyNameArray.push(partyNameValue);
    str = `${partyNameArray.join(",")}`;

    let searchData = _createSearchData();
    $partyNameHistory = [...$partyNameHistory, ...history.view];
    $partyNameData = [...searchData, ...$partyNameData];
    $partyNameHighlight = $partyNameHighlight + "|" + str;

    dispatch("partyNameData", {
      partyNameData: searchData,
      history: history.view,
      highlight: str,
    });
  }

  function _createSearchData() {
    let result = [];

    history.view = [];
    history.view.push(`Party Name : ${partyNameArray.join(",")}`);

    let q = partyNameArray;
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

<div class="w-full mb-2 -py-px select">
  <Select
    loadOptions={searchPartyName}
    {optionIdentifier}
    {getSelectionLabel}
    {getOptionLabel}
    placeholder="Search for Party Name in Cases Cited"
    inputStyles="font-size: 1em"
  />
</div>

<style type="text/css">
  * {
    box-sizing: border-box;
  }
  * {
    box-sizing: border-box;
  }

  .select {
    font-size: 1em;
    --border: 1px solid #9e9e9e;
  }

  .select:focus {
    --border: 1px solid black;
  }
</style>
