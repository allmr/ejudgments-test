<script>
  import axios from "axios";
  import AccordionComponent from "../utils/AccordionComponent.svelte";
  import { failure } from "../utils/Toast";
  import {
    judgementResult,
    fullJudgementResult,
    totalRecords,
    baseUrl,
    USERNAME,
    PASSWORD,
    boost,
  } from "../model/store.js";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let subClause;
  export let act;

  let act_name_exact = "";
  let isOpen = false;
  let isloader = false;
  let subClauseValue = "";
  let subClausesArray = [];
  let searchData = [];
  let mustNotParams = [];
  let query = [];

  const toggle = async (event) => {
    mustNotParams = [];
    subClausesArray = [];
    query = [];
    searchData = [];
    subClauseValue = event.detail.value;
    act_name_exact = `"${act}"`;
    query.push(act_name_exact);
    query.push(subClauseValue);

    searchData.push({
      simple_query_string: {
        query: `${query.join("+")}`,
        fields: ["HeadNote"],
        default_operator: "and",
      },
    });

    isloader = true;

    if (searchData.length === 0) {
      failure("No Search Criteria");
      isloader = false;
      return false;
    }
    let data = {
      query: {
        bool: {
          must: searchData,
          should: boost,
          must_not: mustNotParams,
        },
      },
      sort: [
        {
          doj_sort: { order: "desc" },
        },
      ],
    };

    delete data.sort;

    let countNumber = await axios({
      url: `${baseUrl}/judgement/nearlaw/_count`,
      auth: {
        username: USERNAME,
        password: PASSWORD,
      },
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: data,
    });

    data.from = 0;
    data.size = 50;

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

    if (result.data.hits.total.value === 0) {
      failure("No Results Found");
      isloader = false;
      return false;
    }
    isloader = false;
    $totalRecords = countNumber.data.count;
    $judgementResult = result.data.hits.hits;
    $fullJudgementResult = result.data.hits.hits;
    isOpen = !isOpen;

    dispatch("toggleSubclause", {
      isOpen: isOpen,
      actName: act,
      subClauseName: subClause,
      subClausesArray: subClausesArray,
      judgementResult: $judgementResult,
      totalRecords: $totalRecords,
      query: data,
    });
  };
</script>

<AccordionComponent accordionTitle={subClause} on:toggleD={toggle} />
{#if isloader}
  <div class="loader" />
{/if}
{#if isOpen}
  <div id="highlight">
    {#each subClausesArray as subclause}
      <div class="px-3 subClause">
        &bull; {subclause}
      </div>
    {/each}
  </div>
{/if}

<style>
  .subClause {
    cursor: pointer;
    font-size: 1.2em;
  }

  .subClause:hover {
    text-decoration: underline;
  }
</style>
