<script>
  import { getContext } from "svelte";
  import EquivalentDialog from "./EquivalentDailog.svelte";
  const { open } = getContext("simple-modal");
  import { dark } from "../model/store.js";
  export let message;
  export let className;
  export let CitationArray;

  let name;
  let status = 0;
  // const onCancel = (text) => {
  // 	name = "";
  // 	status = -1;
  // };

  const showDialog = () => {
    open(
      EquivalentDialog,
      {
        message: message,
        CitationArray: CitationArray,
      },
      {
        closeButton: true,
        closeOnEsc: true,
        closeOnOuterClick: true,
      }
    );
  };
</script>

<button class={className} class:dark={$dark} on:click={showDialog}>
  Equivalent Citation
</button>

<style type="text/css">
  @media print {
    .no-print {
      display: none;
    }
  }
</style>
