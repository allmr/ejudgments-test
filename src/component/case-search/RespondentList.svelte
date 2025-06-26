<script>
  import { RespondentName, respondentInfo } from "../../model/store.js";
  const handleClick = (inputRespondentName, el) => {
    // this is equivalent to citation.update(value => value = inputRespondentName)
    $RespondentName = inputRespondentName;
    el.parentNode.classList.remove("bg-gray-300");
    el.parentNode.classList.add("bg-green-400");
  };
</script>

{#if $respondentInfo.length != 0}
  <h3 class="block uppercase tracking-wide text-md font-bold">Respondent</h3>
  {#each $respondentInfo as respondentName, index}
    <div class="bg-gray-300 max-w-sm rounded shadow-lg p-4 my-5" id={index}>
      <div on:click={handleClick(respondentName.view, this)}>
        <li class="list-none font-medium">{respondentName.view}</li>
      </div>
    </div>
  {/each}
{/if}

<style>
  #respondent {
    scrollbar-width: thin;
    -ms-overflow-style: none;
  }

  #respondent::-webkit-scrollbar-track {
    -webkit-box-shadow: none !important;
    background-color: transparent !important;
  }

  #respondent::-webkit-scrollbar {
    width: 12px !important;
    background-color: transparent;
  }

  #respondent::-webkit-scrollbar-thumb {
    background-color: #acacac;
  }
</style>
