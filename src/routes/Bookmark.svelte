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
    mobileNumber
  } from "../model/store.js";
  import { get } from "svelte/store";

  let bookmarks = [];

  // Common auth headers for fetch requests
  const authHeaders = {
    Authorization: "Basic QUxMTVJPTkxJTkVfQVVUSDo0VDlYM1A3UVo2TDFCOFY1",
    "Content-Type": "application/json",
  };

  // Fetch bookmarks using mobile number
  onMount(async () => {
    const number = get(mobileNumber);
    const url = `https://ejudgments.com:4999/api/bookmark/${number}/`;

    try {
      const response = await fetch(url, { headers: authHeaders });
      if (!response.ok) throw new Error("Failed to fetch bookmarks");

      const data = await response.json();

      // Format the date strings
      data.forEach((bookmark) => {
        const ts = new Date(bookmark.time); // ISO string parses cleanly
        bookmark.time = ts.toDateString(); // e.g. "Tue Jun 17 2025"
      });


      bookmarks = data;
    } catch (err) {
      console.error("Fetch error:", err);
      failure("Could not fetch bookmarks");
    }
  });

  // Load full judgment by citation
const handleClick = async (citation) => {
  try {
    const result = await axios({
      url: `${baseUrl}/judgement/nearlaw/_search`,
      auth: {
        username: USERNAME,
        password: PASSWORD,
      },
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
    if (hits && hits.hits && hits.hits.length > 0 && hits.hits[0]._source) {
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


  // Delete a bookmark via backend
  const deleteBookmark = async (citation, index) => {
    const number = get(mobileNumber);
    const url = `https://ejudgments.com:4999/api/bookmark/${number}/`;

    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: authHeaders,
        body: JSON.stringify({ citation }),
      });

      if (!response.ok) throw new Error("Delete failed");

      // Remove from UI
      bookmarks.splice(index, 1);
      bookmarks = [...bookmarks];
      success("Deleted");
    } catch (err) {
      console.error("Delete error:", err);
      failure("Failed to delete bookmark");
    }
  };
</script>

{#each bookmarks as bookmark, i}
  <div class="flex flex-col overflow-auto bg-white rounded shadow-lg p-4 my-5">
    <div class="w-full citation">
      <li class="list-none font-medium">{bookmark.citation}</li>
    </div>
    <span>{bookmark.time}</span>
    <div class="flex flex-row mt-2">
      <button
        on:click={() => deleteBookmark(bookmark.citation, i)}
        class="float-right mr-4 hover:bg-gray-400 text-white font-bold py-2 px-4 bg-red-500 rounded inline-flex items-center"
      >
        Delete
      </button>
      <button
        on:click={() => handleClick(bookmark.citation)}
        class="float-right primary-btn hover:bg-gray-400 font-bold py-2 px-4 rounded inline-flex items-center"
      >
        View
      </button>
    </div>
  </div>
{/each}

<style>
  div.citation {
    cursor: pointer;
  }
</style>
