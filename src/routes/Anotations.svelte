<script>
  import { push } from "svelte-spa-router";
  import { onMount } from "svelte";
  import { success, failure } from "../utils/Toast";
  import axios from "axios";
  import {
    baseUrl,
    USERNAME,
    PASSWORD,
    fullJudgementData,
    mobileNumber,
  } from "../model/store.js";
  import { get } from "svelte/store";

  let annotations = [];

  const authHeaders = {
    Authorization: "Basic QUxMTVJPTkxJTkVfQVVUSDo0VDlYM1A3UVo2TDFCOFY1", 
    "Content-Type": "application/json",
  };

  // Fetch all annotations on component mount
  onMount(async () => {
    const number = get(mobileNumber);
    const url = `https://ejudgments.com:4999/api/annotation/${number}`;

    try {
      const response = await fetch(url, { headers: authHeaders });
      if (!response.ok) throw new Error("Failed to fetch annotations");

      const data = await response.json();

      data.forEach((item) => {
        const ts = new Date(item.time);
        item.time = ts.toDateString(); 
      });

      annotations = data;
    } catch (err) {
      console.error("Fetch error:", err);
      failure("Could not fetch annotations");
    }
  });

  // View full judgment by citation
  const handleClick = async (citation) => {
    try {
      const result = await axios({
        url: `${baseUrl}/judgement/nearlaw/_search`,
        auth: { username: USERNAME, password: PASSWORD },
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: {
          size: 1,
          query: {
            bool: {
              must: [
                {
                  simple_query_string: {
                    query: `"${citation}"`,
                    fields: ["Citation"],
                  },
                },
              ],
            },
          },
        },
      });

      const hits = result.data.hits;
      if (hits && hits.hits && hits.hits[0] && hits.hits[0]._source) {
        $fullJudgementData = hits.hits[0]._source;
        push("/fulljudgement");
      } else {
        failure("No matching judgment found");
      }
    } catch (err) {
      console.error("Judgment load failed:", err);
      failure("Failed to load full judgment");
    }
  };

  // Delete annotation from backend
  const deleteAnnotation = async (citation, annotationText, index) => {
    const number = get(mobileNumber);
    const url = `https://ejudgments.com:4999/api/annotation/${number}/`;

    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: authHeaders,
        body: JSON.stringify({
          citation: citation,
        }),
      });

      if (!response.ok) throw new Error("Delete failed");

      annotations.splice(index, 1);
      annotations = [...annotations];
      success("Deleted");
    } catch (err) {
      console.error("Delete error:", err);
      failure("Failed to delete annotation");
    }
  };
</script>

{#each annotations as item, i}
  <div class="overflow-auto bg-white rounded shadow-lg p-4 my-5">
    <div class="flex flex-col">
      <li class="list-none font-medium">{item.citation}</li>
      <li class="list-none font-medium italic">
          {#if item.annotation.split(' ').length > 12}
            {item.annotation.split(' ').slice(0, 12).join(' ')}...
          {:else}
            {item.annotation}
          {/if}
		</li>
      <span>{item.time}</span>
      <div class="flex flex-row mr-4 mt-2">
        <button
          on:click={() => deleteAnnotation(item.citation, item.annotation, i)}
          class="bg-red-500 hover:bg-gray-400 text-white font-bold py-2 px-4 rounded"
        >
          Delete
        </button>
        <button
          on:click={() => handleClick(item.citation)}
          class="primary-btn hover:bg-gray-400 font-bold py-2 px-4 rounded"
        >
          Edit
        </button>
      </div>
    </div>
  </div>
{/each}

<style>
  div.citation {
    cursor: pointer;
  }
</style>
