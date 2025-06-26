<script>
  //import index from "../../model/flexConfig.js";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  $: inputYear = "";
  $: inputNumber = "";
  $: inputCaseType = "";
  const searchYear = (inputYear) => {
    let result = index.search(inputYear, {
      field: "Case_No",
    });
    return result;
  };
  const searchNumber = (inputYear, inputNumber) => {
    let result = index.search({
      query: `${inputYear}(${inputNumber})`,
      field: "Case_No",
    });
    return result;
  };
  const searchCaseType = (inputYear, inputNumber, inputCaseType) => {
    if (inputNumber !== undefined || inputNumber !== "") {
      let result = index.search({
        query: `${inputYear}(${inputNumber}) ${inputCaseType}`,
        field: "Case_No",
      });
      return result;
    } else {
      let result = index.search({
        query: `${inputYear} ${inputCaseType}`,
        field: "Case_No",
      });
      return result;
    }
  };

  $: finalData = searchYear(inputYear);
  $: finalData = searchNumber(inputYear, inputNumber);
  $: finalData = searchCaseType(inputYear, inputNumber, inputCaseType);

  async function handleClick(name) {
    let options = {
      field: "Case_No",
    };
    let result = await index.search(name, options);
    dispatch("finalData", {
      finalData: result,
    });
  }
</script>

<div class="w-full max-w-xs">
  <form class="bg-white shadow-md rounded px-4 pt-3 pb-4 mb-2">
    <div class="mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2">
        Case Type
      </label>
      <input
        class="shadow appearance-none border rounded w-full py-2 px-3
        text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        type="text"
        name="type"
        bind:value={inputCaseType}
      />
    </div>
    <div class="mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2">Case No</label>
      <input
        class="shadow appearance-none border rounded w-full py-2 px-3
        text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        type="text"
        name="number"
        bind:value={inputNumber}
      />
    </div>
    <div class="mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2">
        Case Year
      </label>
      <input
        class="shadow appearance-none border rounded w-full py-2 px-3
        text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        type="number"
        min="1950"
        max="2020"
        name="year"
        bind:value={inputYear}
      />
    </div>
  </form>

  <div class="result">
    {#each finalData as caseName}
      <li on:click={() => handleClick(caseName.Case_No)}>{caseName.Case_No}</li>
    {/each}
  </div>
</div>

<style>
  * {
    outline: none;
  }
  input {
    border: 1px solid #9e9e9e;
  }
</style>
