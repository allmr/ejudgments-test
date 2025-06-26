<script>
  export let listData;

  const handleClick = (Citation) => {
    console.log("Citation", Citation);
  };
</script>

{#each listData as item}
  {item.id}
  <div
    on:click={handleClick(item.Citation)}
    class="overflow-auto bg-gray-300 max-w-sm rounded shadow-lg p-4 my-5"
  >
    {item.Citation}
  </div>
{/each}
