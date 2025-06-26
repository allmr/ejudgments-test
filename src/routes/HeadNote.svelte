<script>
  import { addCitationLinks, addParaLinks } from "../utils/linksModule.svelte";
  export let headnote = "";
  $: if (headnote !== "") {
    headnote = addParaLinks(addCitationLinks(headnote));
  }
</script>

<span class="font-bold">
  {@html headnote.replace(/\n/g, "<br>")}
</span>
