<script>
  import { onMount, tick } from "svelte";
  import PdfViewer from "../component/PdfViewer.svelte";
  import { fullJudgementData } from "../model/store.js";
  let name = $fullJudgementData.pdfurl;

  console.log("fullJudgementData:", $fullJudgementData);
  let url = `./pdf/${name.slice(name.lastIndexOf("/") + 1)}`;
</script>

<div class="container mx-auto">
  {#if name !== "" && name !== undefined}
    <PdfViewer {url} />
  {/if}
</div>
