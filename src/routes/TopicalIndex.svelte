<script>
  import { onMount } from "svelte";
  import { push } from "svelte-spa-router";
  import axios from "axios";
  import Fa from "svelte-fa";
  import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
  import { citationElasticSearch } from "../utils/CitationSearchModule.svelte";
  import {
    fullJudgementData,
    baseUrl,
    USERNAME,
    PASSWORD,
    boost,
    alpha,
    letters,
  } from "../model/store.js";
  import Mark from "mark.js";
  import { success, failure, deafult } from "../utils/Toast";
  let ele = "A";
  let isloader = false;
  let headingsArray = [];
  let headings = [];
  let citationsArray = [];
  let singleJudgementData;
  let heading_name_exact = "";
  let count;
  let query = [];
  let currentPage = 0;
  let pageSize = 0;
  let mustNotParams = [];
  let searchData = [];
  let headingName = "";
  let headingSplit = [];
  let data;
  let instance;

  onMount(() => {
    ele = "A";
    headingsArray = [];
    alpha[ele]["default"].forEach((element) => {
      if (element.HeadNote.length > 0) {
        element.HeadNote.forEach((el) => {
          if (el.heading.length > 0) {
            el.heading.forEach((heading) => {
              if (heading.startsWith(ele) == true) {
                headingSplit = heading.split(" ");
                if (headingSplit.length < 5) {
                  headingsArray.push(heading);
                }
              }
            });
          }
        });
      }
    });
    headings = [...new Set(headingsArray)];
    headings.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  });

  async function getCitationDetail() {
    headingName = event.target.innerHTML;
    searchData = [];
    query = [];
    heading_name_exact = `"${headingName}"`;
    query.push(heading_name_exact);
    localStorage.setItem("ActName", heading_name_exact);
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
    count = countNumber.data.count;
    citationsArray = result.data.hits.hits;
    query = data;
  }

  function getData(event) {
    ele = event.target.innerHTML;
    headingsArray = [];
    alpha[ele]["default"].forEach((element) => {
      if (element.HeadNote.length > 0) {
        element.HeadNote.forEach((el) => {
          if (el.heading.length > 0) {
            el.heading.forEach((heading) => {
              if (heading.startsWith(ele) == true) {
                headingSplit = heading.split(" ");
                if (headingSplit.length < 5) {
                  headingsArray.push(heading);
                }
              }
            });
          }
        });
      }
    });
    headings = [...new Set(headingsArray)];
    headings.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
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
    let result = await axios({
      url: `${baseUrl}/judgement/nearlaw/_search`,
      auth: {
        username: USERNAME,
        password: PASSWORD,
      },
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: query,
    });
    isloader = false;
    citationsArray = result.data.hits.hits;
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

  function highlight(heading_name_exact) {
    // instance.unmark({
    //   done: function (counter) {},
    // });
    instance = new Mark(
      document.getElementById(event.target.nextElementSibling.innerHTML)
    );

    instance.mark(heading_name_exact.trim(), {
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

        <div id="headings">
          {#if headings}
            {#each headings as heading}
              <div
                on:click={() => getCitationDetail()}
                class="px-3 bold cursor-pointer"
              >
                {heading}
              </div>
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
                  class="border cursor-pointer border-black rounded-md p-3 m-2 heading-name my-auto font-bold"
                  on:click={() => highlight(headingName)}
                  >{headingName}
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
  .heading-name {
    font-size: 1.2em;
  }
  hr.new1 {
    border-top: 2px solid black;
  }
  button:focus {
    outline: 0;
    border: 0;
  }

  #headings {
    height: 500px;
    overflow-y: scroll;
  }
  #citations {
    height: 500px;
    overflow-y: scroll;
  }
</style>
