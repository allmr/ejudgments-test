<script>
  import { partyNameSearch } from "../../model/flexConfig";
  import { createEventDispatcher } from "svelte";

  let pnAutoFill = [];
  let partyNameValue = "";

  $: isPartyNameOpen =
    partyNameValue === "" || pnAutoFill.length === 0 ? false : true;

  $: partyNameUlClass = !isPartyNameOpen
    ? "autocomplete-results hide-results"
    : "autocomplete-results ";

  $: if (partyNameValue !== "") {
    partyName(partyNameValue);
  }
  const dispatch = createEventDispatcher();

  const setPartyNameValue = (event) => {
    pnAutoFill = [];
    partyNameValue = event.target.id;
  };

  const addPartyName = () => {
    let result = partyNameValue;
    partyNameValue = "";
    dispatch("partyNameData", {
      value: result,
    });
  };

  const partyName = async (input) => {
    let result = [];
    if (input.length > 5) {
      result = await partyNameSearch.search({
        size: 100,
        query: input,
        field: "partyName",
        sort: "partyName",
      });
    }
    pnAutoFill = result;
    return result;
  };
</script>

<div class="w-4/5 mr-1">
  <input
    class="w-full text-gray-700 rounded py-2 px-4 leading-tight border-8
    border-gray-700 focus:outline-none focus:border-blue-700"
    placeholder="Cases Cited By Party Name"
    bind:value={partyNameValue}
  />
</div>
<div class="w-1/5">
  <button
    class="border-solid border-2 border-blue-500 bg-blue-500 rounded inline-flex
    float-right active:bg-blue-700 hover:bg-blue-700 hover:border-blue-700
    focus:outline-none py-1 px-4 mt-px text-white font-bold"
    on:click={addPartyName}
  >
    ADD
  </button>
</div>
{#if isPartyNameOpen}
  <ul class={partyNameUlClass}>
    {#each pnAutoFill as item}
      <li
        class="bg-gray-100 hover:bg-gray-300 px-2 py-2 text-lg"
        id={item.partyName}
        on:click={setPartyNameValue}
      >
        {item.partyName}
      </li>
    {/each}
  </ul>
{/if}

<style type="text/css">
  * {
    box-sizing: border-box;
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
    width: 100%;
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
  input {
    border: 1px solid #9e9e9e;
  }
</style>
