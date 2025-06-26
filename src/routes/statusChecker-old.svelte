<script>
  import { statusCheck } from "../model/flexConfig.js";
  import { citationElasticSearch } from "../utils/CitationSearchModule.svelte";
  import { addCitationLinks } from "../utils/linksModule.svelte";
  import {
    fullJudgementData,
    status_checker_history_db,
    status,
  } from "../model/store.js";
  import { push } from "svelte-spa-router";
  import { onMount, afterUpdate } from "svelte";
  import Select from "svelte-select";
  import { failure } from "../utils/Toast";

  let str = [];
  let show_histories = [];
  let citations = [];
  let headnotes = [];
  let hData = {}; // History Data
  let words = 50;
  let citation_status = false;
  let overruled = false;
  let isloader = false;
  let citation = "";
  let value = "";
  let type = "Read Less...";
  hData.view = [];

  onMount(async () => {
    showHistories();
  });

  afterUpdate(async () => {
    let elements = document.getElementsByClassName("links");

    Array.from(elements).forEach(function (element) {
      element.addEventListener("click", () => {
        return searchCitation(event);
      });
    });
    showHistories();
  });

  const optionIdentifier = "id";
  const getOptionLabel = (option) => option.overRuledCitation;

  const getSelectionLabel = (option) => {
    citation = option.overRuledCitation;
    return option.overRuledCitation;
  };

  const searchOverRuledCitation = async (input) => {
    let result;
    result = await statusCheck.search({
      limit: 100,
      query: `${input}`,
      field: "overRuledCitation",
    });
    return result;
  };

  const searchCitation = async () => {
    let q = event.target.innerHTML;
    let result = await citationElasticSearch(q);
    if (result.data.hits.total.value === 0) {
      failure("Not included in your package");
      return false;
    }
    $fullJudgementData = result.data.hits.hits[0]._source;
    localStorage.setItem("statusCheckerClick", "true");
    localStorage.setItem("citation", $fullJudgementData.Citation);
    push("/fullJudgement");
  };

  const checkStatus = async () => {
    str = [];
    hData.view = [];
    if (citation != "") {
      $status = await statusCheck.search({
        query: `${citation}`,
        field: "overRuledCitation",
      });
      console.log($status);
      if (!$status.length) {
        overruled = false;
      } else {
        overruled = true;
        $status.forEach((e) => {
          e.status.forEach((el) => {
            str = [
              ...str,
              addCitationLinks(
                `${e.overRuledCitation} ${el.statusText} by ${el.overRulingCitation}`
              ),
            ];
            if (e.overRuledCitation != undefined) {
              if (e.overRuledCitation.includes(" : ") == true) {
                citations = e.overRuledCitation.split(" : ");
              } else {
                citations.push(e.overRuledCitation);
              }
            }
            citations.push(el.overRulingCitation);
          });
        });
      }
      citations = [...new Set(citations)];
      console.log(citations);
      getHeadnote(citations);
      hData.time = Date.now();
      hData.query = `${citation}`;
      hData.view.push(`Citation : ${citation}`);
      status_checker_history_db
        .post(hData)
        .then(function (result) {})
        .catch(function (err) {});
    } else failure("Select Citation before Checking Status");
  };

  const searchHistory = async (index) => {
    isloader = true;
    let data = show_histories[index].query;
    str = [];
    $status = await statusCheck.search({
      query: data,
      field: "overRuledCitation",
    });
    if (!$status.length) {
      overruled = false;
    } else {
      overruled = true;
      $status.forEach((e) => {
        e.status.forEach((el) => {
          str = [
            ...str,
            addCitationLinks(
              `${e.overRuledCitation} ${el.statusText} by ${el.overRulingCitation}`
            ),
          ];
          citations.push(el.overRulingCitation);
        });
      });
    }
    getHeadnote(citations);
    isloader = false;
    push("/statusChecker");
  };

  async function getHeadnote() {
    headnotes = [];
    for (let i = 0; i < citations.length; i++) {
      result = await citationElasticSearch(citations[i]);
      if (result === true) {
        data = result.data.hits.hits[0]._source;
        headnotes.push(data);
      }
    }
    headnotes = headnotes;
    citation_status = true;
    citations = [];
  }
  const close = async (id, rev, index) => {
    status_checker_history_db.remove(id, rev);
    show_histories = show_histories.filter((x, i) => {
      if (i != index) {
        return x;
      }
    });
    showHistories();
  };

  async function showHistories() {
    show_histories = await status_checker_history_db
      .createIndex({
        index: { fields: ["time"] },
      })
      .then(function () {
        return status_checker_history_db.find({
          selector: { time: { $lt: Date.now() } },
          sort: [{ time: "desc" }],
          limit: 20,
        });
      });

    show_histories = show_histories.docs.map((x, index) => {
      let object = {};
      object._id = x._id;
      object._rev = x._rev;
      object.index = index;
      let ts = new Date(x.time);
      object.time = ts.toDateString();
      object.view = x.view;
      object.query = x.query;
      return object;
    });
  }

  function readMore() {
    value = event.srcElement.parentElement.id;
    type = event.target.innerHTML;
  }
</script>

<div class="container mx-auto" id="home">
  <div class="flex mb-4">
    <div class="w-1/3 ">
      <div class="ml-2 mr-2 mt-12 p-4 rounded shadow-lg bg-white">
        <label
          class="block text-gray-700 text-sm font-bold mb-2"
          for="Citation"
        >
          Citation/Writ No.
        </label>
        <Select
          loadOptions={searchOverRuledCitation}
          {optionIdentifier}
          {getSelectionLabel}
          {getOptionLabel}
        />
        <button
          class="primary-btn centered-btn m-2 font-bold py-2 px-4 rounded
      inline-flex items-center"
          on:click={() => {
            checkStatus();
          }}
        >
          CHECK
        </button>
        {#if overruled}
          <ul class="px-6 py-4 bg-red-500 text-white font-bold">
            {#each str as item}
              <li>
                {@html item}
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </div>
    <div class="w-1/3">
      {#if citation_status}
        <div id="citations">
          {#each headnotes as headnote}
            <div
              class="ml-2 mr-2 mt-12 rounded shadow-lg p-4 bg-white"
              id={headnote.Citation}
            >
              <div class="text-center font-bold uppercase underline text-2xl">
                {headnote.Citation}
              </div>
              {#if value == headnote.Citation && type == "Read More..."}
                <div class="text-justify">
                  {headnote.HeadNote}
                </div>
                <button
                  class="primary-btn font-bold py-2 px-2 mt-2 mb-1 rounded focus:outline-none
                  focus:shadow-outline flex justify-end"
                  on:click={() => {
                    readMore();
                  }}
                >
                  Read Less...</button
                >
              {:else if type == "Read Less..."}
                <div class="text-justify">
                  {headnote.HeadNote.split(" ").splice(0, words).join(" ")}
                </div>
                <button
                  class="primary-btn font-bold py-2 px-2 mt-2 mb-1 rounded focus:outline-none
                  focus:shadow-outline flex justify-end"
                  on:click={() => {
                    readMore();
                  }}
                >
                  Read More...</button
                >
              {:else}
                <div class="text-justify">
                  {headnote.HeadNote.split(" ").splice(0, words).join(" ")}
                </div>
                <button
                  class="primary-btn font-bold py-2 px-2 mt-2 mb-1 rounded focus:outline-none
                  focus:shadow-outline flex justify-end"
                  on:click={() => {
                    readMore();
                  }}
                >
                  Read More...</button
                >
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>
    <div class="w-1/3 ml-2 mr-8 max-w-sm rounded overflow-hidden">
      <div class="font-bold text-2xl">Case Status History</div>
      {#if isloader}
        <div class="loader" />
      {/if}
      {#each show_histories as history, i}
        <div
          class="inline-flex w-full mt-3 bg-white cursor-pointer rounded py-3
        hover:bg-green-300 shadow-lg"
        >
          <div
            class="overflow-auto w-full pl-4"
            on:click={() => {
              searchHistory(history.index);
            }}
          >
            {#each history.view as item}
              <div>
                <span class="font-semibold text-xl tracking-tight">{item}</span>
              </div>
            {/each}
            <span>{history.time}</span>
          </div>
          <span
            class="close flex justify-end pr-4"
            on:click={() => {
              close(history._id, history._rev, i);
            }}
          >
            &#9932;
          </span>
        </div>
      {/each}
    </div>
  </div>
</div>

<!-- </div> -->
<style type="text/css">
  .centered-btn {
    position: relative;
    left: 50%;
    transform: translateX(-50%);
  }
  .close {
    font-size: 20px;
    cursor: pointer;
  }

  #citations {
    height: 500px;
    overflow-y: scroll;
  }
</style>
