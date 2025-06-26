<script>
  import { actNameSearch } from "../../model/flexConfig.js";
  import { push } from "svelte-spa-router";
  import {
    judgementResult,
    totalRecords,
    baseUrl,
    history_db,
    query,
    USERNAME,
    PASSWORD,
    boost,
  } from "../../model/store.js";
  import { createEventDispatcher } from "svelte";
  import axios from "axios";
  import { failure } from "../../utils/Toast";
  const dispatch = createEventDispatcher();

  export let actAbbr = "";
  export let actName = ""; //its a prop comes from outside the component

  let isloader = false;
  let headnote = false;
  let count = 0;
  let countAct = 0;
  $: actNameValue = actName;
  $: subClause = "";
  $: subClauses = [];
  $: actSearch = [];
  $: searchActName(actNameValue);

  const searchActName = (acv) => {
    let result = actNameSearch.search({
      sort: "view",
      query: acv,
      field: "view",
    });
    dispatch("finalData", {
      finalData: result,
      id: "act",
    });
  };

  function addActToSearch() {
    if (
      actNameValue === null ||
      subClauses === null ||
      actNameValue === "undefined" ||
      subClauses === "undefined" ||
      actAbbr === ""
    ) {
      failure("No results Found");
      isloader = false;
      return false;
    } else {
      let id = countAct++;
      let actObj = {
        id: id,
        name: actNameValue,
        abbr: JSON.parse(actAbbr),
        actSubClauses: subClauses,
      };
      actSearch = [...actSearch, actObj];
      _resetAct();
    }
  }

  function _resetAct() {
    actName = "";
    subClause = "";
    subClauses = [];
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
    actSearch.forEach((x) => {
      let q = "";
      if (x.actSubClauses.length !== 0) {
        let abbr = _makeSubAbbreviation(_getAbbrArray(x.actSubClauses));
        if (x.abbr.length > 0) {
          q = `(("${x.name.slice(0, -6)}")|(\"${x.abbr.join(
            '")|("'
          )}\"))+(("${abbr.join('"+"')}")|("${x.actSubClauses.join('"+"')}"))`;
        } else {
          q = `("${x.name.slice(0, -6)}")|("${x.actSubClauses.join('"+"')}")`;
        }
      } else {
        if (x.abbr.length > 0) {
          q = `(("${x.name.slice(0, -6)}")|(\"${x.abbr.join('")|("')}\"))`;
        } else {
          q = `("${x.name.slice(0, -6)}")`;
        }
      }
      result.push({
        simple_query_string: {
          query: q,
          fields: f,
          default_operator: "and",
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

  function addSubClauses(event) {
    let SROA = document.getElementById("all-SROA").value;
    if (event.key === "Enter") {
      subClauses = [...subClauses, `${SROA} ${subClause}`];
      subClause = "";
    }
  }

  async function searchAct() {
    isloader = true;
    let hData = {};
    hData.view = [];
    let str = "";
    actSearch.forEach((element) => {
      if (element.actSubClauses.length === 0) {
        str += `${element.name.slice(0, -6)}|${element.abbr.join("|")}`;
      } else {
        let abbr = _makeSubAbbreviation(_getAbbrArray(element.actSubClauses));
        str += `${element.name.slice(0, -6)}|${element.abbr.join(
          "|"
        )}|${abbr.join("|")}|${element.actSubClauses.join("|")}`;
      }
      hData.view.push(
        `Act Name : ${element.name}\r\n${element.actSubClauses.join(",")}`
      );
      if (actSearch.length > 1) {
        str += "|";
      }
    });
    localStorage.setItem("highlight", str);
    let searchData = _createSearchData();
    let data = {
      query: {
        bool: {
          must: searchData,
          should: boost,
          // must_not: {
          //   simple_query_string: {
          //     query: "Nearlaw",
          //     fields: ["Citation"]
          //   }
          // }
        },
      },
    };

    let countNumber = await axios({
      url: `${baseUrl}/judgement/nearlaw/_count`,
      auth: {
        username: USERNAME, //change value if required in model/stote.js
        password: PASSWORD, //change value if required in model/store.js
      },
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: data,
    });

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
        username: USERNAME, //change value if required in model/stote.js
        password: PASSWORD, //change value if required in model/store.js
      },
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: data,
    });

    $query = data;

    if (result.data.hits.total.value === 0) {
      failure("No results Found");
      isloader = false;
      return false;
    }
    hData.time = Date.now();
    hData.query = data;
    history_db
      .post(hData)
      .then(function (result) {
        console.log(result);
      })
      .catch(function (err) {
        console.log(err);
      });
    $judgementResult = result.data.hits.hits;
    $totalRecords = countNumber.data.count;
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

  const countResults = async () => {
    let searchData = _createSearchData();
    let data = {
      query: {
        bool: {
          must: searchData,
          should: boost,
        },
      },
    };
    let result = await axios({
      url: `${baseUrl}/judgement/nearlaw/_count`,
      auth: {
        username: USERNAME, //change value if required in model/stote.js
        password: PASSWORD, //change value if required in model/store.js
      },
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: data,
    });
    count = result.data.count;
  };

  const deleteAct = (id) => {
    actSearch = actSearch.filter((e) => {
      return e.id != id;
    });
  };
</script>

{#if isloader}
  <div class="loader" />
{/if}
<div class="w-full max-w-xs">
  <div class="bg-white shadow-md rounded px-4 pt-3 pb-4 mb-2 overflow-hidden">
    <!-- Act name -->
    <div class="flex flex-row mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2">Act Name</label>
      <!-- Search in Headnote -->
      <label class="ml-10 block text-gray-700 font-bold">
        <input class="leading-tight" type="checkbox" bind:checked={headnote} />
        <span class="text-sm">
          <b>Headnote</b>
        </span>
      </label>
    </div>
    <div class="mb-4">
      <input
        class="shadow appearance-none border border rounded w-full py-2 px-3
        text-gray-700 mb-2 leading-tight focus:border-black"
        type="text"
        name="actName"
        bind:value={actNameValue}
      />
    </div>
    <!-- Act Content(Section,Order,Rule,Article) -->
    <div class="mb-4">
      <select
        class="shadow appearance-none border border rounded w-full py-2 px-3
        text-gray-700 mb-2 leading-tight focus:border-black"
        id="all-SROA"
      >
        <option value="Section">Section</option>
        <option value="Rule">Rule</option>
        <option value="Order">Order</option>
        <option value="Article">Article</option>
      </select>
    </div>
    <!-- Act SubClause -->
    <div class="mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2">Number</label>
      <input
        class="shadow appearance-none border border rounded w-full py-2 px-3
        text-gray-700 mb-2 leading-tight focus:border-black"
        type="text"
        name="actName"
        on:keydown={addSubClauses}
        bind:value={subClause}
      />
      <p class="text-sm text-gray 400">Enter to add more S./O./Art./R.</p>
    </div>
    <!-- pills for subclauses -->
    <div class="mb-4 flex content-between flex-wrap">
      {#each subClauses as clause}
        <button
          class="w-1/2 mt-1 bg-blue-500 hover:bg-blue-700 text-white font-normal
          text-sm py-1 px-2 rounded-full"
        >
          {clause}
        </button>
      {/each}
    </div>

    <div class="mb-4 flex content-center">
      <!-- Add More Acts -->
      <button
        class="primary-btn font-bold py-2 px-4 rounded inline-flex items-center"
        on:click={addActToSearch}
      >
        Add
      </button>
    </div>
    <div class="mb-4 flex flex-col content-center">
      {#each actSearch as act}
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
    <!-- Search -->
    {#if actSearch.length > 0}
      <div class="flex flex-row">
        <div class="mb-4">
          <button
            class="secondary-btn py-2 px-4 rounded inline-flex items-center"
            on:click={countResults}
          >
            Count
          </button>
        </div>
        <div class="mb-4 ml-5">
          <button
            class="primary-btn font-bold py-2 px-4 rounded inline-flex
            items-center"
            on:click={searchAct}
          >
            Search
          </button>
        </div>
      </div>
    {/if}
    {#if count !== 0}
      <label class="block text-white text-xl font-bold p-2 mb-2 bg-green-500">
        Total Count : {count}
      </label>
    {:else}
      <label class="block text-white text-xl font-bold p-2 mb-2 bg-red-600">
        Total Count : {count}
      </label>
    {/if}
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
