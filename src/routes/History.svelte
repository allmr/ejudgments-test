<script>
  import {
    judgementResult,
    totalRecords,
    highlight,
    history_db,
    baseUrl,
    query,
    fullJudgementResult,
    USERNAME,
    PASSWORD,
  } from "../model/store.js";
  import axios from "axios";
  import { push } from "svelte-spa-router";
  import { onMount, afterUpdate } from "svelte";
  let isloader = false;
  let show_histories = [];
  $highlight = [];
  let high = "";
  const searchHistory = async (index) => {
    isloader = true;
    let data = show_histories[index].query;
    let countData = data;

    delete countData.from;
    delete countData.size;
    delete countData.sort;

    let countNumber = await axios({
      url: `${baseUrl}/judgement/nearlaw/_count`,
      auth: {
        username: USERNAME,
        password: PASSWORD,
      },
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: countData,
    });

    localStorage.setItem("citationClick", "false");
    data = countData;
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
    let searchQuery = data.query.bool.must[0].simple_query_string.query;
    let q = '"';
    let qu = "(";
    if (
      (searchQuery.startsWith(q) == true && searchQuery.endsWith(q) == true) ||
      searchQuery.startsWith(qu)
    )
      $highlight.push(searchQuery);
    else {
      let temp = searchQuery.split(" ");
      temp.forEach((element) => {
        $highlight.push(temp);
      });
    }

    high = $highlight.flat(Infinity).join("|");
    high = high.replace(/\)+/gm, "");
    high = high.replace(/\(+/gm, "");
    high = high.replace(/\"+/gm, "");
    high = high.replace(/\++/gm, "|");

    $query = data;
    $totalRecords = countNumber.data.count;
    $judgementResult = result.data.hits.hits;
    $fullJudgementResult = result.data.hits.hits;

    localStorage.setItem("highlight", high);
    localStorage.setItem("indexValue", 0);
    localStorage.setItem("sort", "latest");
    localStorage.setItem("filter", "all");
    localStorage.setItem("citationClick", "false");
    localStorage.setItem("casesCitedClick", "false");
    localStorage.setItem("statusCitationClick", "false");
    localStorage.setItem("statusCheckerClick", "false");
    localStorage.setItem("totalRecords", $totalRecords);
    push("/judgement");
  };

  onMount(async () => {
    show_histories = await history_db
      .createIndex({
        index: { fields: ["time"] },
      })
      .then(function () {
        return history_db.find({
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
  });

  const close = async (id, rev, index) => {
    history_db.remove(id, rev);
    show_histories = show_histories.filter((x, i) => {
      if (i != index) {
        return x;
      }
    });
    show_histories = await history_db
      .createIndex({
        index: { fields: ["time"] },
      })
      .then(function () {
        return history_db.find({
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
    console.log("show histories", show_histories);
  };
</script>

{#if isloader}
  <div class="loader" />
{/if}
{#each show_histories as history, i}
  <div
    class="inline-flex w-full mt-5 bg-white cursor-pointer rounded py-3
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

<style>
  .close {
    font-size: 20px;
    cursor: pointer;
  }
</style>
