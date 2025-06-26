<script>
  import { getContext } from "svelte";

  export let message;
  export let text = "";
  export let hasForm = false;
  export let onCancel = () => {};
  export let onOkay = () => {};

  const { close } = getContext("simple-modal");

  let plainText = text;

  function _onCancel() {
    onCancel();
    close();
  }

  function _onOkay() {
    onOkay(plainText);
    close();
  }
</script>

<h1 class="font-sans text-center mb-3 text-xl">{message}</h1>

{#if hasForm}
  <textarea
    bind:value={plainText}
    rows="10"
    class="w-full p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Type your annotation here..."
  />
{/if}

<div class="buttons flex mt-3 gap-2">
  <button
    class="w-1/2 flex-1 bg-white text-gray-500 border border-gray-400 rounded
    py-3 hover:bg-gray-100 font-sans font-bold"
    on:click={_onCancel}
  >
    Cancel
  </button>

  <button
    class="w-1/2 flex-1 bg-white text-green-500 border border-green-500 rounded
    py-3 focus:outline-none focus:bg-green-500 focus:text-white hover:bg-green-500 hover:text-white font-sans font-bold"
    on:click={_onOkay}
  >
    Save
  </button>
</div>
