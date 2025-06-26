<script>
  import { PetitionerName, petitionerInfo } from "../../model/store.js";

  const handleClick = (inputPetitionerName, el) => {
    // this is equivalent to citation.update(value => value = inputPetitionerName)
    $PetitionerName = inputPetitionerName;
    el.parentNode.classList.remove("bg-gray-300");
    el.parentNode.classList.add("bg-green-400");
  };
</script>

{#if $petitionerInfo.length != 0}
  <h3 class="block uppercase tracking-wide text-md font-bold">Petitioner</h3>
  {#each $petitionerInfo as petitionerName, index}
    <div class="bg-gray-300 max-w-sm rounded shadow-lg p-4 my-5" id={index}>
      <div on:click={handleClick(petitionerName.view, this)}>
        <li class="list-none font-medium">{petitionerName.view}</li>
      </div>
    </div>
  {/each}
{/if}

<style>
</style>
