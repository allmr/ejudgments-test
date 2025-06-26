<script>
  import { slide } from "svelte/transition";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  export let year;

  let isOpen = false;

  function toggle() {
    isOpen = !isOpen;
    dispatch("toggledata", {
      isOpen: isOpen,
    });
  }
</script>

<button on:click={toggle} aria-expanded={isOpen} class="">
  <span class="inline-block">
    <svg
      width="20"
      height="20"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d="M9 5l7 7-7 7" />
    </svg>
  </span>

  <span class="inline-block">{year}</span>
</button>

<style>
  button {
    border: none;
    outline: 0;
    background: none;
    display: block;
    color: inherit;
    cursor: pointer;
    margin: 0;
    font-size: 2em;
  }

  svg {
    transition: transform 0.2s ease-in;
    padding: auto 0 !important;
  }

  [aria-expanded="true"] svg {
    transform: rotate(0.25turn);
  }
</style>
