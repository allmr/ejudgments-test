<script>
  import { addCitationLinks } from "../utils/linksModule.svelte";
  export let cases = "";
  $: if (cases !== "") {
    cases = addCitationLinks(cases);
  }
</script>

<div>
  {@html cases.replace(/\n/g, "<br>")}
</div>
