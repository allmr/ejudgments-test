<script>
  import { fade } from "svelte/transition";
  export let updatedCitation;
</script>

<div class="relative px-5 py-5">
  <div transition:fade>{updatedCitation.HeadNote}</div>
</div>

<style>
</style>
