<script>
  import { JudgeName, judgeInfo, JudgeNameList } from "../../model/store.js";

  // const className = "overflow-auto max-w-sm rounded shadow-lg p-4 my-5";
  const className = "bg-gray-300 max-w-sm rounded shadow-lg p-4 my-5";
  const select = (index) => {
    if ($JudgeNameList.indexOf($judgeInfo[index]) === -1) {
      $JudgeNameList = [...$JudgeNameList, $judgeInfo[index]];
    } else {
      $JudgeNameList.splice($JudgeNameList.indexOf($judgeInfo[index]), 1);
    }
  };
</script>

{#if $judgeInfo.length != 0}
  <h3 class="block uppercase tracking-wide text-md font-bold">Judge</h3>
  {#each $judgeInfo as judgeName, index}
    <div
      id={`jName(${index})`}
      class={$JudgeNameList.indexOf(judgeName) !== -1
        ? `${className}  bg-green-400`
        : `${className}`}
      on:click={() => {
        select(index);
      }}
    >
      <div>
        <li class="list-none font-medium">{judgeName.Judge_name}</li>
      </div>
    </div>
  {/each}
{/if}

<style>
</style>
