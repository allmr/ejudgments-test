<script>
  import { onMount, afterUpdate } from "svelte";
  import { actNameSearch } from "../../model/flexConfig.js";
  import {
    highlight,
    actHighlight,
    actData,
    actHistory,
    actSearch,
  } from "../../model/store.js";
  import { createEventDispatcher } from "svelte";
  import Select from "svelte-select";

  const dispatch = createEventDispatcher();

  export let actName = ""; //its a prop comes from outside the component
  let actNameValue = "";
  let headnote = true;
  let countAct = 0;
  let history = {};
  let subClauseInput = "";

  onMount(() => {
    subClauseInput = document.getElementById("subClause").value;
  });
  afterUpdate(() => {
    subClauseInput = document.getElementById("subClause").value;
  });

  const optionIdentifier = "id";
  const getOptionLabel = (option) => option.view;
  const getSelectionLabel = (option) => {
    actNameValue = option;
    return option.view;
  };

  $: subClause = "";
  $: subClauses = [];

  const searchActName = async (acv) => {
    let result = await actNameSearch.search({
      sort: "view",
      query: acv,
      field: "view",
    });
    return result;
  };

  function addActToSearch() {
    if (
      actNameValue === null ||
      subClauses === null ||
      actNameValue === "undefined" ||
      subClauses === "undefined"
    ) {
      return false;
    }
    let id = countAct++;
    let actObj = {
      id: id,
      name: actNameValue.view,
      abbr: actNameValue.abbr,
      actSubClauses: subClauses,
    };

    $actSearch = [...$actSearch, actObj];

    //reset
    _resetAct();

    //highlight
    let str = "";

    $actSearch.forEach((element) => {
      if (element.actSubClauses.length === 0) {
        str += `${element.name.slice(0, -6)}|${element.abbr.join("|")}`;
      } else {
        let abbr = _makeSubAbbreviation(_getAbbrArray(element.actSubClauses));
        str += `${element.name.slice(0, -6)}|${element.abbr.join(
          "|"
        )}|${abbr.join("|")}|${element.actSubClauses.join("|")}`;
      }
      if (actSearch.length > 1) {
        str += "|";
      }
    });
    let searchData = _createSearchData(); //creating search data
    $actHistory = [...$actHistory, ...history.view];
    $actData = [...searchData, ...$actData];
    $actHighlight = $actHighlight + "|" + str;
    dispatch("actdata", {
      actData: searchData,
      history: history.view,
      highlight: str,
    });
  }

  function _resetAct() {
    actName = "";
    subClause = "";
    subClauses = [];
  }

  function resetAct() {
    try {
      _resetAct();
      $actSearch = [];
    } catch (e) {
      console.log(e);
    }
  }
  function _getAbbrArray(abbr) {
    let result = ["$", "$", "$", "$"];
    abbr.forEach((x) => {
      if (/Section (\d)+/gm.test(x)) {
        result[0] = result[0].concat(x + "$");
      }
      if (/Order (\d)+/gm.test(x)) {
        result[1] = result[1].concat(x + "$");
      }
      if (/Article (\d)+/gm.test(x)) {
        result[2] = result[2].concat(x + "$");
      }
      if (/Rule (\d)+/gm.test(x)) {
        result[3] = result[3].concat(x + "$");
      }
    });
    result.forEach((x, index) => {
      x = x.slice(0, -1);
      result[index] = x;
    });
    return result;
  }

  function _createSearchData() {
    let result = [];
    history.view = [];
    const f = headnote
      ? ["HeadNote"]
      : [
          "Citation",
          "Court",
          "Judge_name",
          "Petitioner",
          "Respondent",
          "doj",
          "Adv_petitioner",
          "Adv_respondent",
          "HeadNote^2",
          "cases_cited",
          "judgement^3",
        ];

    $actSearch.forEach((x) => {
      let q = "";
      if (x.actSubClauses.length !== 0) {
        //if there re sub clauses entered
        let abbr = _makeSubAbbreviation(_getAbbrArray(x.actSubClauses));
        q = `(("${x.name.slice(0, -6)}")|("${x.abbr.join(
          '")|("'
        )}"))+(("${abbr.join('"|"')}")|("${x.actSubClauses.join('"+"')}"))`;
        history.view.push(`Act name : ${x.name}\n${x.actSubClauses}`);
      } else {
        // if not added
        q = `("${x.name.slice(0, -6)}")|("${x.abbr.join('")|("')}")`;
        history.view.push(`Act name : ${x.name}`);
      }
      result.push({
        simple_query_string: {
          query: q,
          fields: f,
        },
      });
    });
    return result;
  }

  function _makeSubAbbreviation(abbr) {
    let abc = ["", "", "", ""];
    let xyz = [];
    let finalArray = [];
    let singleNum;
    let value;
    let final = "";

    const letter = ["S.", "O.", "Art.", "R."];
    const letters = ["Ss.", "Oo.", "Arts.", "Rr."];
    for (let index = 0; index < abbr.length; index++) {
      if (abbr[index] === "") {
        continue;
      }
      let num = "";
      let a = [];
      const element = abbr[index];
      a = Array.from(new Set(element.split("$")));

      if (a.length === 2) {
        xyz[index] = letter[index];
      } else {
        xyz[index] = letter[index];
        abc[index] = letters[index];
      }
      for (let i = 1; i < a.length && a !== undefined; i++) {
        num += a[i].match(/(\d+.*[a-z|A-z])|(\d+)/g)[0] + ", "; // to find the Digit or Digit preceding the number
      }
      abc[index] += num.slice(0, -2);

      for (let i = 1; i < a.length && a !== undefined; i++) {
        singleNum = a[i].match(/(\d+.*[a-z|A-z])|(\d+)/g)[0] + ", "; // to find the Digit or Digit preceding the number
        if (xyz[index] !== undefined) {
          value = xyz[index] + singleNum.slice(0, -2);
          finalArray.push(value);
        }
        final = finalArray.join("+");
        finalArray = [];
        finalArray.push(final);
      }
    }
    abc.forEach((ele) => {
      finalArray.push(ele);
    });
    var reg = new RegExp("^[0-9]*$");
    finalArray = finalArray.filter(function (el) {
      return el.length !== 0 && reg.test(el) == false;
    });
    return finalArray;
  }

  function addSubClauses() {
    let SROA = document.getElementById("all-SROA").value;
    subClause = `${SROA} ${subClause}`;
    subClauses = [...subClauses, subClause];
    subClause = "";
  }

  const deleteAct = (id) => {
    $actSearch = $actSearch.filter((e) => {
      return e.id != id;
    });
    let searchData = _createSearchData();
    dispatch("actdata", {
      actData: searchData,
      history: history.view,
    });
  };
</script>

<div class="-mx-3 px-3">
  <!-- Act name -->
  <div class="flex flex-row justify-between w-full mb-1">
    <label class="block uppercase tracking-wide text-xl font-bold">
      Act Name
      <!-- Search in Headnote -->
    </label>
    <div>
      <input class="leading-tight" type="checkbox" bind:checked={headnote} />
      <span class="text-sm">Headnote</span>
    </div>
  </div>
  <div class="w-full mb-2 -py-px select">
    <Select
      loadOptions={searchActName}
      {optionIdentifier}
      {getSelectionLabel}
      {getOptionLabel}
      placeholder="Search for Act"
      inputStyles="font-size: 1em"
    />
  </div>
  <!-- Act Content(Section,Order,Rule,Article) -->
  <div class="flex flex-row w-full justify-between">
    <select
      class="shadow appearance-none border rounded py-2 px-3 text-gray-700
      leading-tight focus:outline-none focus:border-black"
      id="all-SROA"
    >
      <option value="Section">Section</option>
      <option value="Rule">Rule</option>
      <option value="Order">Order</option>
      <option value="Article">Article</option>
    </select>

    <!-- Act SubClause -->
    <!-- <div> -->
    <input
      class="text-gray-700 border w-10/12 rounded py-2 px-3 leading-tight
      focus:bg-white focus:border-black"
      type="text"
      name="actName"
      placeholder="Number"
      id="subClause"
      bind:value={subClause}
    />
    {#if subClauseInput.length != 0}
      <button
        on:click={addSubClauses}
        class="border-solid border-2 border-blue-500 bg-blue-500 rounded
        inline-flex float-right active:bg-blue-700 hover:bg-blue-700
        hover:border-blue-700 focus:outline-none py-1 px-4 text-white font-bold"
      >
        ADD
      </button>
    {:else}
      <button
        on:click={addSubClauses}
        class="border-solid border-2 border-gray-500 bg-gray-500 rounded
        inline-flex float-right active:bg-gray-700 focus:outline-none py-1 px-4
        text-white font-bold disabled:opacity-50"
        disabled
      >
        ADD
      </button>
    {/if}
    <!-- </div> -->
  </div>
  <div class="flex flex-row justify-between mb-2">
    <!-- Pills for sections -->
    {#each subClauses as clause}
      <button
        class="w-1/4 mt-1 bg-blue-500 hover:bg-blue-700 text-white font-bold
        text-sm rounded-full"
      >
        {clause}
      </button>
    {/each}
  </div>
  <div class="flex content-center">
    <!-- Add More Acts -->
    <button
      class="border-solid border-2 border-blue-500 bg-blue-500 rounded
      inline-flex float-right active:bg-blue-700 hover:bg-blue-700
      hover:border-blue-700 focus:outline-none py-1 px-4 text-white font-bold"
      on:click={addActToSearch}
    >
      ADD
    </button>
    <div hidden id="resetAct" on:click={resetAct}>Delete</div>
  </div>
  <div class="mb-4 flex flex-col content-center">
    {#each $actSearch as act}
      <div class="flex flex-row">
        <div class="flex flex-col mt-1 bg-white shadow-md text-sm px-2">
          <span class="font-bold">{act.name}</span>
          <br />
          <span class="font-normal">{act.actSubClauses.join(" ")}</span>
        </div>
        <div class="self-center" on:click={deleteAct(act.id)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="black"
            width="18px"
            height="18px"
          >
            <path
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41
              19 12 13.41 17.59 19 19 17.59 13.41 12z"
            />
            <path d="M0 0h24v24H0z" fill="none" />
          </svg>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  * {
    outline: none;
  }
  select {
    background-color: white !important;
    border: 1px solid #9e9e9e;
  }
  .text-xl {
    font-size: 0.8rem;
  }
  input {
    border: 1px solid #9e9e9e;
  }

  .select {
    --border: 1px solid #9e9e9e;
  }

  .select:focus {
    --border: 1px solid black;
  }
</style>
