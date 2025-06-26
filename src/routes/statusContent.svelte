<script>
  import { getContext } from "svelte";
  import { fly } from "svelte/transition";
  import statusDialog from "./statusDailog.svelte";
  const { open } = getContext("simple-modal");
  import { anotation_db, dark } from "../model/store";
  export let message;
  export let className;
  export let statusArray;
  import Fa from "svelte-fa";
  import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
  let name;
  let status = 0;
  const onCancel = (text) => {
    name = "";
    status = -1;
  };

  const showDialog = () => {
    console.log(statusArray);
    open(
      statusDialog,
      {
        message: message,
        statusArray: statusArray,
      },
      {
        closeButton: true,
        closeOnEsc: true,
        closeOnOuterClick: true,
      }
    );
  };
</script>

<span class={className} class:dark={$dark} on:click={showDialog}>
  <span class="flex my-auto">
    <Fa icon={faPenToSquare} scale={0.5} size="2x" />
  </span>
  <span class="flex my-2 ml-1 mr-3">Status</span>
</span>

<!-- <button class={className} class:dark={$dark} on:click={showDialog}>
  Status
</button> -->
