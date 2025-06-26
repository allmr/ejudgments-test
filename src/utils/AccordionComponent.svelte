<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  export let accordionTitle;

  let isOpen = false;

  function toggle() {
    isOpen = !isOpen;
    dispatch("toggleD", {
      isOpen: isOpen,
      value: accordionTitle,
    });
  }
</script>

<button on:click={toggle} aria-expanded={isOpen}>
  <span class="inline-block">{accordionTitle}</span>
</button>

<style>
  button {
    border: none;
    border-bottom: 2px solid black;
    outline: 0;
    background: none;
    display: block;
    color: inherit;
    cursor: pointer;
    margin: 0;
    margin-left: 0.3em;
    margin-bottom: 0.4em;
    font-size: 1.3em;
    font-weight: bold;
    text-align: left !important;
  }
</style>
