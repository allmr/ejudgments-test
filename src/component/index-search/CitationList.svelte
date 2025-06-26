<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let listDatas;
  const handleClick = (list, id, index) => {
    let value = "";
    switch (id) {
      case "act":
        value = JSON.stringify({ view: list.view, abbr: list.abbr });
        break;
      case "judge_name":
        value = JSON.stringify({ view: list.Judge_name, abbr: list.abbr });
        break;
      case "adv_name":
        value = JSON.stringify({ name: list.name, abbr: list.abbr });
        break;
    }
    document.getElementById(index).style.backgroundColor = "#48BB78";
    listDatas.id = id;
    listDatas.data = [list];
    dispatch("listEvent", {
      listData: { value, id },
    });
  };
</script>

{#if listDatas === null}
  <div>No Suggestions</div>
{:else}
  {#each listDatas.data as list, i}
    <div
      id={i}
      on:click={handleClick(list, listDatas.id, i)}
      class="overflow-auto bg-gray-300 max-w-sm rounded shadow-lg p-4 my-5"
    >
      {list.view || list.Judge_name || list.name}
    </div>
  {/each}
{/if}
