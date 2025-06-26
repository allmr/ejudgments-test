<script>
  import * as A from "../../alphabets/A.json";
  import * as B from "../../alphabets/B.json";
  import * as C from "../../alphabets/C.json";
  import * as D from "../../alphabets/D.json";
  import * as E from "../../alphabets/E.json";
  import * as F from "../../alphabets/F.json";
  import * as G from "../../alphabets/G.json";
  import * as H from "../../alphabets/H.json";
  import * as I from "../../alphabets/I.json";
  import * as J from "../../alphabets/J.json";
  import * as K from "../../alphabets/K.json";
  import * as L from "../../alphabets/L.json";
  import * as M from "../../alphabets/M.json";
  import * as N from "../../alphabets/N.json";
  import * as O from "../../alphabets/O.json";
  import * as P from "../../alphabets/P.json";
  import * as Q from "../../alphabets/Q.json";
  import * as R from "../../alphabets/R.json";
  import * as S from "../../alphabets/S.json";
  import * as T from "../../alphabets/T.json";
  import * as U from "../../alphabets/U.json";
  import * as V from "../../alphabets/V.json";
  import * as W from "../../alphabets/W.json";
  import * as X from "../../alphabets/X.json";
  import * as Y from "../../alphabets/Y.json";
  import * as Z from "../../alphabets/Z.json";

  import axios from "axios";
  import AccordionComponent from "../utils/AccordionComponent.svelte";
  import SubClause from "./SubClause.svelte";
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

  export let act;
  export let ele;

  let act_name_exact = "";
  let isOpen = false;
  let isloader = false;
  let actName = "";
  let subClauses = [];
  let subClauseArray = [];
  let mustNotParams = [];
  let searchData = [];
  let query = [];
  let subClausesArray = [];
  let judgements;
  let totalCount = 0;
  let subClause;
  let data;

  const toggle = async (event) => {
    subClauses = [];
    subClauseArray = [];
    actName = event.detail.value;
    searchData = [];
    query = [];
    act_name_exact = `"${actName}"`;
    query.push(act_name_exact);
    localStorage.setItem("ActName", act_name_exact);
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
    data = {
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
    subClausesArray = createSubClausesArray(eval(ele));

    isOpen = !isOpen;

    dispatch("toggleAct", {
      isOpen: isOpen,
      actName: act,
      subClauses: subClausesArray,
      judgements: $judgementResult,
      totalCount: $totalRecords,
      query: data,
    });
  };

  function createSubClausesArray(letter) {
    letter.forEach((element) => {
      if (element.HeadNote.length > 0) {
        element.HeadNote.forEach((el) => {
          if ("act_name" in el) {
            if (el.act_name == actName) {
              if ("sub_clause" in el) {
                if (typeof el.index == "object") {
                  el.index.forEach((ele) => {
                    subClauseArray.push(ele);
                  });
                } else if (typeof el.index == "string") {
                  subClauseArray.push(el.index);
                }
              }
            }
          }
        });
      }
    });
    subClauses = [...new Set(subClauseArray)];
    subClauses.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    return subClauses;
  }

  //citations to be dispatched
  const toggleSubClause = (event) => {
    judgements = event.detail.judgementResult;
    totalCount = event.detail.totalRecords;
    subClause = event.detail.subClauseName;
    data = event.detail.query;

    dispatch("toggleAct", {
      isOpen: isOpen,
      actName: act,
      subClauseName: subClause,
      subClauses: subClauses,
      judgements: judgements,
      totalCount: totalCount,
      query: data,
    });
  };
</script>

<AccordionComponent accordionTitle={act} on:toggleD={toggle} />
{#if isloader}
  <div class="loader" />
{/if}
{#if isOpen}
  <div id="highlight">
    {#each subClauses as subClause}
      <SubClause {act} {subClause} on:toggleSubclause={toggleSubClause} />
    {/each}
  </div>
{/if}

<style>
</style>
