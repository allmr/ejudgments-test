<script>
  import { AdvocateName, advocateInfo } from "../../model/store.js";
  const handleClick = (inputAdvocateName) => {
    // this is equivalent to citation.update(value => value = inputAdvocateName)
    $AdvocateName = inputAdvocateName;
  };
</script>

{#each $advocateInfo as advocateName}
  <div class="overflow-auto bg-gray-300 max-w-sm rounded shadow-lg p-4 my-5">
    <div on:click={handleClick(advocateName.Adv_petitioner)}>
      <li class="list-none font-medium">{advocateName.Adv_petitioner}</li>
    </div>
  </div>
{/each}

<style>
</style>
