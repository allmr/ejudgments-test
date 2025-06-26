<script>
  import { judgementResult } from "../model/store.js";
  import index from "../model/flexConfig.js";

  let judgementTable = $judgementResult;
  let fullJudgementData;

  const onTableClick = (citation) => {
    let result = index.search({
      query: citation,
      field: "Citation",
    });
    fullJudgementData = result;
    return result;
  };
</script>

<div class="flex flex-col mx-5">
  <div class="overflow-auto h-64">Test1</div>
  <div class="overflow-auto h-64">
    <table class="table w-full">
      <thead>
        <tr>
          <th class="px-4 py-2">Date</th>
          <th class="px-4 py-2">Citation</th>
          <th class="px-4 py-2">Party Name</th>
          <th class="px-4 py-2">Tribunal</th>
          <th class="px-4 py-2">Full Judgement</th>
        </tr>
      </thead>
      <tbody>
        {#each judgementTable as jTable}
          <tr>
            <td
              class="border px-4 py-2"
              on:click={() => onTableClick(jTable.Citation)}
            >
              {jTable.Date}
            </td>
            <td
              class="border px-4 py-2"
              on:click={() => onTableClick(jTable.Citation)}
            >
              {jTable.Citation}
            </td>
            <td
              class="border px-4 py-2"
              on:click={() => onTableClick(jTable.Citation)}
            >
              {jTable.Petitioner}
            </td>
            <td
              class="border px-4 py-2"
              on:click={() => onTableClick(jTable.Citation)}
            >
              {jTable.tribunal}
            </td>
            <a href="#/fulljudgement" getProps={fullJudgementData}>Show</a>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
