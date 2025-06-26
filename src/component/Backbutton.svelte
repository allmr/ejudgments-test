<script>
  import { pop } from "svelte-spa-router";
  import Tooltip from "../utils/Tooltip.svelte";
  import Fa from "svelte-fa";
  import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
  let isloader = false;
  function back() {
    isloader = true;
    pop();
    isloader = false;
  }
</script>

{#if isloader}
  <div class="loader" />
{/if}
<!-- <Tooltip> -->
<div class="tracking-wide font-bold" on:click={() => back()}>
  <Fa icon={faArrowLeft} scale={1} size="2x" />
  <!-- <svg
        class="h-5 w-5 mx-2 fill-current text-black"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20">
        <path d="M10 13h8V7h-8V2l-8 8 8 8v-5z" />
      </svg> -->
</div>
<!-- Back
</Tooltip> -->
