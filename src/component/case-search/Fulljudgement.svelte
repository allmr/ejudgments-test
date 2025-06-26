<script>
  import { autoFillSearch } from "../../model/flexConfig";
  import { createEventDispatcher } from "svelte";

  let fjAutoFill = [];
  let fullJudgementValue = "";

  $: isfullJudgementOpen =
    fullJudgementValue === "" || fjAutoFill.length === 0 ? false : true;

  $: fullJudgementClass = !isfullJudgementOpen
    ? "autocomplete-results hide-results"
    : "autocomplete-results ";

  $: if (fullJudgementValue !== "") {
    autoFill(fullJudgementValue);
  }
  const dispatch = createEventDispatcher();

  const setfullJudgementValue = (event) => {
    isfullJudgementOpen = false;
    fullJudgementValue = event.target.id;
  };

  const addfullJudgement = () => {
    let result = fullJudgementValue;
    fullJudgementValue = "";
    dispatch("fullJudgementData", {
      value: result,
    });
  };

  const autoFill = async (input) => {
    let result = await autoFillSearch.search({
      size: 100,
      query: input,
      field: "view",
      sort: "view",
    });
    fjAutoFill = result;
    return result;
  };
</script>

<div class="w-4/5 mr-1">
  <input
    class="w-full text-gray-700 rounded py-2 px-4 mb-3 leading-tight
    border-8 border-gray-700 focus:outline-none focus:border-blue-700"
    bind:value={fullJudgementValue}
    placeholder="Full Text Search"
  />
</div>
<div class="w-1/5">
  <button
    class="border-solid border-2 border-blue-500 bg-blue-500 rounded inline-flex float-right 
    active:bg-blue-700 hover:bg-blue-700 hover:border-blue-700 focus:outline-none 
    py-1 px-4 mt-px text-white font-bold"
    on:click={addfullJudgement}
    >ADD
  </button>
</div>
{#if isfullJudgementOpen}
  <ul class={fullJudgementClass}>
    {#each fjAutoFill as item}
      <li
        class="bg-gray-200 hover:bg-gray-300 px-2 py-2 text-lg"
        id={item.view}
        on:click={setfullJudgementValue}
      >
        {item.view}
      </li>
    {/each}
  </ul>
{/if}

<style type="text/css">
  input {
    border: 1px solid #9e9e9e;
  }

  * {
    box-sizing: border-box;
    outline: none;
  }

  .autocomplete {
    position: relative;
  }

  .hide-results {
    display: none;
  }

  .autocomplete-results {
    padding: 0;
    margin: 0;
    border: 1px solid #dbdbdb;
    height: auto;
    overflow: auto;
    width: 80%;
    max-height: 20em;
    background-color: white;
    box-shadow: 2px 2px 24px rgba(0, 0, 0, 0.1);
    position: absolute;
    z-index: 100;
    top: 0;
    transform: translateY(-100%);
  }

  .autocomplete-result {
    color: #7a7a7a;
    list-style: none;
    text-align: left;
    height: 2rem;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
  }

  .autocomplete-result > :global(span) {
    background-color: none;
    color: #242424;
    font-weight: bold;
  }

  .autocomplete-result.is-active,
  .autocomplete-result:hover {
    background-color: #dbdbdb;
  }
</style>
