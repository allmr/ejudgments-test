<script>
  //import index from "../../model/flexConfig.js";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  $: name = "";
  $: NominalDataList = "";

  function searchName() {
    let options = {
      query: name,
      field: ["Respondent", "Petitioner"],
    };
    NominalDataList = index.search(options);
  }

  async function handleClick(data) {
    dispatch("finalData", {
      finalData: [data],
    });
  }
</script>

<div class="w-full max-w-xs">
  <form class="bg-white shadow-md rounded px-4 pt-3 pb-4 mb-2">
    <div class="mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2">
        Nominal Search
      </label>
      <input
        class="shadow appearance-none border rounded w-full py-2 px-3
        text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        type="text"
        bind:value={name}
        on:keyup={searchName}
      />
    </div>
  </form>
</div>
<div>
  {#each NominalDataList as nominalData}
    {#if nominalData !== "" && nominalData !== undefined}
      <li on:click={() => handleClick(nominalData)}>
        {nominalData.Petitioner} VS {nominalData.Respondent}
      </li>
    {/if}
  {/each}
</div>

<style>
  * {
    outline: none;
  }
  input {
    border: 1px solid #9e9e9e;
  }
</style>
