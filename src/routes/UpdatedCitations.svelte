<script>
  import { onMount, afterUpdate } from "svelte";
  import updatedCitationData from "../model/updatedCitationData";
  import axios from "axios";
  import {
    fullJudgementData,
    judgementResult,
    baseUrl,
    USERNAME,
    PASSWORD,
  } from "../model/store.js";
  import { push } from "svelte-spa-router";
  import { SvelteToast } from "@zerodevx/svelte-toast";
  import { success, failure, deafult } from "../utils/Toast";
  let isloader = false;

  onMount(() => {});

  afterUpdate(() => {});

  const test = async (event) => {
    isloader = true;
    let q = event.target.innerHTML;
    let data = {
      from: 0,
      size: 15,
      query: {
        bool: {
          must: [
            {
              simple_query_string: {
                fields: ["Citation"],
                query: `"${q}"`,
              },
            },
          ],
        },
      },
    };
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
    if (result.data.hits.total.value == 0) {
      isloader = false;
      deafult.show("Citation not found");
    } else {
      let singleJudgementData = result.data.hits.hits[0]._source;
      $fullJudgementData = singleJudgementData;
      $judgementResult = [];
      isloader = false;
      push("/fulljudgement");
    }
  };
</script>

<div class="container mx-auto">
  {#if isloader}
    <div class="loader" />
  {/if}
  <h1 class="text-center text-xl my-2 capitalize">
    List of Updated Citations : {updatedCitationData.length}
  </h1>
  <div class="bg-white">
    {#each updatedCitationData as item}
      <div class="ml-2" on:click={test}>{item.citationName}</div>
      <hr />
    {/each}
  </div>
</div>

<style>
</style>
