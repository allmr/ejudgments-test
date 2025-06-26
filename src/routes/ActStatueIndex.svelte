<script>
  import { onMount } from "svelte";
  import { push } from "svelte-spa-router";
  import axios from "axios";
  import Fa from "svelte-fa";
  import Mark from "mark.js";
  import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
  import ActStatue from "../utils/ActStatue.svelte";
  import { citationElasticSearch } from "../utils/CitationSearchModule.svelte";
  import {
    fullJudgementData,
    baseUrl,
    USERNAME,
    PASSWORD,
    alpha,
    letters,
  } from "../model/store.js";
  import { success, failure, deafult } from "../utils/Toast";

  let ele = "A";
  let isloader = false;
  let actsArray = [];
  let acts = [];
  let citationsArray = [];
  let singleJudgementData;
  let act_name = "";
  let sub_clause = "";
  let count;
  let query = [];
  let currentPage = 0;
  let pageSize = 0;
  let instance;
  let message;

  onMount(() => {
    ele = "A";
    actsArray = [];
    alpha[ele]["default"].forEach((element) => {
      if (element.HeadNote.length > 0)
        element.HeadNote.forEach((el) => {
          if (el.act_name.startsWith(ele) == true) {
            actsArray.push(el.act_name);
          }
        });
    });
    acts = [...new Set(actsArray)];
    acts.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  });

  const toggle = (event) => {
    citationsArray = event.detail.judgements;
    act_name = event.detail.actName;
    count = event.detail.totalCount;
    query = event.detail.query;
    sub_clause = event.detail.subClauseName;
    // sub_clauses_array = event.detail.subClauses;
  };

  function getData(event) {
    ele = event.target.innerHTML;
    actsArray = [];
    citationsArray = [];
    console.log(alpha[ele]);
    alpha[ele]["default"].forEach((element) => {
      if (element.HeadNote.length > 0) {
        element.HeadNote.forEach((el) => {
          if (el.act_name.startsWith(ele) == true) {
            actsArray.push(el.act_name);
          }
        });
      }
    });
    acts = [...new Set(actsArray)];
    acts.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }

  async function searchCitation(q) {
    let result = await citationElasticSearch(q, true);
    if (result) {
      singleJudgementData = result.data.hits.hits[0]._source;
      $fullJudgementData = singleJudgementData;
      push("/fulljudgement");
    }
  }

  const onNextPage = async () => {
    isloader = true;
    pageSize = 50;
    currentPage += pageSize;
    query.from = currentPage;
    if (currentPage > count) {
      currentPage -= pageSize;
      deafult("Cannot go to next page.");
      isloader = false;
      return false;
    }
    query.sort = [
      {
        doj_sort: { order: "desc" },
      },
    ];
    let results = await axios({
      url: `${baseUrl}/judgement/nearlaw/_search`,
      auth: {
        username: USERNAME,
        password: PASSWORD,
      },
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: query,
    });
    citationsArray = results.data.hits.hits;
    isloader = false;
  };

  const onPreviousPage = async () => {
    isloader = true;
    pageSize = 50;
    currentPage -= pageSize;

    if (currentPage < 0) {
      currentPage = 0;
      deafult("Cannot go to previous page.");
      isloader = false;
      return false;
    }
    query.from = currentPage;
    query.sort = [
      {
        doj_sort: { order: "desc" },
      },
    ];
    let results = await axios({
      url: `${baseUrl}/judgement/nearlaw/_search`,
      auth: {
        username: USERNAME,
        password: PASSWORD,
      },
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: query,
    });
    citationsArray = results.data.hits.hits;
    isloader = false;
  };
  const scrollUp = () => {
    window.scrollTo(0, 0);
  };
  function highlight(act_name_exact, sub_clause_exact) {
    // instance.unmark({
    //   done: function (counter) {},
    // });
    instance = new Mark(
      document.getElementById(event.target.nextElementSibling.innerHTML)
    );

    instance.mark(act_name_exact.trim(), {
      accuracy: "partially",
      separateWordSearch: false,
      done: function (counter) {
        if (counter != 0) {
          message = `${counter} matches found!!!`;
          success(message);
        }
      },
      noMatch: function (range) {
        failure("No matches found");
      },
    });
    if (sub_clause_exact != undefined) {
      instance.mark(sub_clause_exact.trim(), {
        accuracy: "partially",
        separateWordSearch: false,
        done: function (counter) {
          if (counter != 0) {
            message = `${counter} matches found!!!`;
            success(message);
          }
        },
        noMatch: function (range) {
          failure("No matches found");
        },
      });
    }
  }
</script>

{#if isloader}
  <div class="loader" />
{/if}
<div class="container mx-auto mt-5">
  <div class="border flex justify-between border-black py-1 px-2 mx-1">
    {#each letters as letter}
      <span class="letter" on:click={getData}>{letter}</span>
    {/each}
  </div>

  <div class="flex">
    <div class="w-1/3 mt-2 inline-block">
      <div
        class="flex justify-center border border-black w-full text-center text-white font-bold bg-blue-800 text-2xl"
      >
        MAIN TOPIC
      </div>

      <div class="w-full border border-black">
        <div class="flex justify-center font-bold mx-auto text-2xl block">
          {ele}
        </div>

        <div id="acts">
          {#if acts}
            {#each acts as act}
              <ActStatue {act} {ele} on:toggleAct={toggle} />
            {/each}
          {/if}
        </div>
      </div>
    </div>

    {#if citationsArray.length > 0}
      <div class="w-2/3 mt-2 mx-2 inline-block" id="citations">
        <div class="border border-black">
          <!-- <div class="flex justify-center my-4">
            <select
              bind:value={sortSelect}
              on:change={sortBy(sortSelect)}
              class="shadow border rounded py-2 px-3 text-gray-700
                  leading-tight focus:outline-none focus:border-none"
              id="relevance-latest"
            >
              <option value="latest">Latest</option>
              <option value="relevance">Relevance</option>
            </select>
          </div> -->
          <div class="table-container">
            {#if count > 50}
              <div class="flex flex-row bg-green-500 justify-between my-2">
                <p
                  class="p-2 mx-3 underline italic text-white cursor-pointer"
                  on:click={() => onPreviousPage()}
                >
                  Previous Page
                </p>
                <h3
                  class="text-center font-bold text-white text-2xl cursor-pointer"
                >
                  TOTAL RESULTS : {count}
                </h3>

                <p
                  class="p-2 mx-3 underline italic text-white cursor-pointer"
                  on:click={() => onNextPage()}
                >
                  Next Page
                </p>
              </div>
            {:else}
              <div class="bg-green-500 my-2">
                <h3
                  class="text-center font-bold text-white text-2xl cursor-pointer"
                >
                  TOTAL RESULTS : {count}
                </h3>
              </div>
            {/if}
          </div>
          <hr class="new1" />
          <div class="px-2">
            {#each citationsArray as citation}
              <div class="my-5">
                <span class="border border-black rounded-md p-3"
                  >{citation["_source"].Court}</span
                >
                <span
                  class="border cursor-pointer border-black rounded-md p-3 m-2 act-name my-auto font-bold"
                  on:click={() => highlight(act_name, sub_clause)}
                  >{act_name}
                  {#if sub_clause != undefined}
                    {sub_clause}
                  {/if}
                </span>
                <span
                  class="text-3xl my-auto font-bold ms-auto cursor-pointer"
                  on:click={searchCitation(citation["_source"].Citation)}
                  >{citation["_source"].Citation}</span
                >
                <div
                  class="border border-black rounded-md p-2 mt-3 description"
                  id={citation["_source"].Citation}
                >
                  {@html citation["_source"].HeadNote.replace(/\n/g, "<br>")}
                  <div class="flex justify-end">
                    <button
                      class="primary-btn font-bold py-2 px-2 mt-2 mb-1 rounded focus:outline-none
                  focus:shadow-outline ml-auto"
                      on:click={searchCitation(citation["_source"].Citation)}
                      >Full Judgement</button
                    >
                  </div>
                </div>
              </div>
            {/each}
          </div>
          <hr />
        </div>
      </div>
    {/if}
  </div>
  <button
    on:click={scrollUp}
    class="fixed shadow-xl rounded-full h-16 w-16 bg-white right-0
  bottom-0 m-auto no-print flex justify-center"
  >
    <Fa icon={faArrowUp} scale={0.5} size="3x" />
  </button>
</div>

<style>
  .letter {
    font-size: 2em;
    cursor: pointer;
  }
  .description,
  .act-name {
    font-size: 1.2em;
  }
  hr.new1 {
    border-top: 2px solid black;
  }
  button:focus {
    outline: 0;
    border: 0;
  }

  #acts {
    height: 500px;
    overflow-y: scroll;
  }
  #citations {
    height: 500px;
    overflow-y: scroll;
  }
</style>
