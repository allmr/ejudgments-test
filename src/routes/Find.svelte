<script>
  import { getContext } from "svelte";
  import FindDialog from "./FindDailog.svelte";
  import { dark } from "../model/store";
  export let jContainer;
  import Fa from "svelte-fa";
  import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
  const { open } = getContext("simple-modal");
  const showDialog = () => {
    open(
      FindDialog,
      {
        jContainer: jContainer,
      },
      {
        closeButton: true,
        closeOnEsc: true,
        closeOnOuterClick: true,
      }
    );
  };
</script>

<span
  class="flex mx-2 rounded overflow-hidden shadow-lg border-l border-b border-r
  cursor-pointer bg-white"
  class:dark={$dark}
  on:click={showDialog}
>
  <span class="flex my-auto">
    <Fa icon={faMagnifyingGlass} scale={0.5} size="2x" />
  </span>
  <span class="flex my-2 ml-1 mr-3">Find</span>
</span>