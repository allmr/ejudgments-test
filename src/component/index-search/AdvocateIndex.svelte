<script>
  import { advocateNameSearch } from "../../model/flexConfig.js";
  import { createEventDispatcher, onMount } from "svelte";
  import { SvelteToast } from "@zerodevx/svelte-toast";
  import { failure } from "../../utils/Toast";
  import axios from "axios";
  import { push } from "svelte-spa-router";
  import {
    judgementResult,
    totalRecords,
    baseUrl,
    history_db,
    query,
    USERNAME,
    PASSWORD,
  } from "../../model/store.js";

  const dispatch = createEventDispatcher();

  // props
  export let advocateName;
  export let advocateAbbr;
  //check values

  let apcheck;
  let archeck;
  let isloader = false;
  onMount(() => {
    apcheck = true;
    archeck = true;
  });

  const storeHistory = (esQuery) => {
    let hData = {
      time: Date.now(),
      view: [`Advocate Name : ${advocateName}`],
      query: esQuery,
    };
    history_db
      .post(hData)
      .then(function (result) {
        console.log(result);
      })
      .catch(function (err) {
        console.log(err);
      });
  };

  async function searchAdvocate() {
    let searchData = [];
    isloader = false;

    if (advocateAbbr == undefined) {
      failure("No results Found");
      isloader = false;
      return false;
    } else {
      let abbr = JSON.parse(advocateAbbr);
      // let f = ["Adv_petitioner", "Adv_respondent"];
      let q = "";
      let f = [];
      let words = [];
      if (apcheck && archeck) {
        f = ["Adv_petitioner", "Adv_respondent"];
      } else if (apcheck) {
        f = ["Adv_petitioner"];
      } else {
        f = ["Adv_respondent"];
      }
      if (abbr.length > 0) {
        q = `("${advocateName}")|("${abbr.join('")|("')}")`;
        words.push(...abbr, advocateName);
      } else {
        q = `("${advocateName}")`;
        words = [advocateName];
      }
      searchData.push({
        simple_query_string: {
          query: q,
          fields: f,
        },
      });

      let data = {
        query: {
          bool: {
            must: searchData,
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
      } else {
        //store history
        storeHistory(data);
        //highlight Words
        highlight(words.join("|"));
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
    }
  }

  $: searchAdvocateName(advocateNameValue);
  $: advocateNameValue = advocateName;

  const searchAdvocateName = (advName) => {
    let result = [];

    result = advocateNameSearch.search({
      sort: "name",
      query: advName,
      field: "name",
    });
    dispatch("finalData", {
      finalData: result,
      id: "adv_name",
    });
  };
  const highlight = (words) => {
    localStorage.setItem("highlight", words);
  };
</script>

{#if isloader}
  <div class="loader" />
{/if}

<SvelteToast options={{ reversed: true, intro: { y: 192 } }} />
<div class="w-full max-w-xs">
  <div class="bg-white shadow-md rounded px-4 pt-3 pb-4 mb-2 overflow-hidden">
    <div class="mb-4">
      <lable class="block text-gray-700 text-sm font-bold mb-2">
        Advocate Search
      </lable>
      <input
        class="shadow appearance-none border rounded w-full py-2 px-3
        text-gray-700 leading-tight focus:border-black"
        type="text"
        bind:value={advocateNameValue}
      />
    </div>
    <div class="flex flex-row mb-4">
      <div>
        <label class="inline-flex items-center">
          <input type="checkbox" class="form-checkbox" bind:checked={apcheck} />
          <span class="ml-2">Advocate Petitioner</span>
        </label>
      </div>
      <div>
        <label class="inline-flex items-center">
          <input type="checkbox" class="form-checkbox" bind:checked={archeck} />
          <span class="ml-2">Advocate Respondent</span>
        </label>
      </div>
    </div>
    <button
      class="primary-btn font-bold py-2 px-4 float-right rounded inline-flex items-center"
      on:click={searchAdvocate}
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
