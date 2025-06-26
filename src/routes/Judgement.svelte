<script>
  export let judgement = "";
  import { onMount, tick, afterUpdate } from "svelte";
  import { addCitationLinks } from "../utils/linksModule.svelte";
  import Mark from "mark.js";

  $: if (judgement !== "") {
    judgement = addCitationLinks(judgement);
  }
</script>

<p id="fulljudgement" class="text-justify JudgmentPara">
  {@html judgement.replace(/\n\d+/gm, function (x) {
    return `<br><br><a id='${x.replace("\n", "")}'>${x.replace("\n", "")}</a>`;
  })}
</p>

<style>
  .JudgmentPara {
    font-family: "Lexend Deca";
  }
</style>
