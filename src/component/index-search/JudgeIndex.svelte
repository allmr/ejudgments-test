<script>
  //import index from "../../model/flexConfig.js";
  import { createEventDispatcher } from "svelte";
  import { judgeNameSearch } from "../../model/flexConfig.js";
  import { push } from "svelte-spa-router";
  import axios from "axios";
  import { failure } from "../../utils/Toast";
  import {
    baseUrl,
    judgementResult,
    totalRecords,
    query,
    USERNAME,
    PASSWORD,
  } from "../../model/store.js";

  const dispatch = createEventDispatcher();

  export let judgeName = ""; //its a prop comes from outside the component
  export let judgeAbbr;
  let isloader = false;

  const searchJudgeName = (jcv) => {
    if (judgeName.valueOf() !== jcv.valueOf()) {
      let result = judgeNameSearch.search({
        query: jcv,
        field: "Judge_name",
      });
      dispatch("finalData", {
        finalData: result,
        id: "judge_name",
      });
    }
  };

  async function searchJudge() {
    isloader = true;
    let words = [];
    if (judgeAbbr == undefined) {
      failure("No results Found");
      isloader = false;
      return;
    } else {
      let abbr = JSON.parse(judgeAbbr);
      let q = "";
      if (abbr.length > 0) {
        q = `("${judgeName}")|("${abbr.join('")|("')}")`;
        words.push(...abbr, judgeName);
      } else {
        q = `("${judgeName}")`;
        words = [judgeName];
      }
      let data = {
        query: {
          bool: {
            must: [
              {
                simple_query_string: {
                  fields: ["Judge_name"],
                  query: `${q}`,
                  default_operator: "and",
                },
              },
            ],
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

      highlight(words.join("|"));
      $query = data;
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
      if ($totalRecords === 0) {
        failure("No results Found");
        isloader = false;
        return;
      }
      isloader = false;
      push("/judgement");
    }
  }

  const highlight = (words) => {
    localStorage.setItem("highlight", words);
  };

  $: inputJudgeName = searchJudgeName(judgeNameValue);
  $: judgeNameValue = judgeName;
</script>

{#if isloader}
  <div class="loader" />
{/if}
<div class="w-full max-w-xs">
  <div class="bg-white shadow-md rounded px-4 pt-3 pb-4 mb-2 overflow-hidden">
    <div class="mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2">
        Judge Name
      </label>
      <input
        class="shadow appearance-none border rounded w-full py-2 px-3
        text-gray-700 leading-tight focus:border-black"
        type="text"
        bind:value={judgeNameValue}
      />
    </div>
    <button
      class="primary-btn text-gray-800 font-bold py-2 px-4 rounded float-right
      inline-flex items-center"
      on:click={searchJudge}
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
