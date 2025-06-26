<script>
  import { slide } from "svelte/transition";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let id = 0;
  export let openedAccordion = 0;
  export let className = "plus-minus-toggle collapsed";
  // function setOpenAccordian(value) {
  //   openAccordian.update(n => (n == value ? 0 : value));
  // }
  const open = () => {
    let element = document.getElementById(`${id}`);
    console.log("element", element);
    if (openedAccordion === 0) {
      document.getElementById(`${id}`).classList.toggle("collapsed");
    } else if (openedAccordion === element.id) {
      element.classList.toggle("collapsed");
    } else {
      let ele = document.querySelector("div.plus-minus-toggle:not(.collapsed)");
      ele.classList.add("collapsed");
      element.classList.toggle("collapsed");
    }

    dispatch("accordionSelected", id);
  };
</script>

<!-- on:click={()=>setOpenAccordian(id)} -->
<div class="p-4 relative cursor-pointer" on:click={open}>
  <slot name="title" />
  <div {id} class={className} />
</div>

{#if id == openedAccordion}
  <div class="collapsible-body" transition:slide|local>
    <slot />
  </div>
{/if}

<style>
  /* black backgroud */
  .plus-minus-toggle-black {
    cursor: pointer;
    height: 21px;
    position: absolute;
    width: 21px;
    top: 50%;
    right: 20px;
  }
  .plus-minus-toggle-black:before,
  .plus-minus-toggle-black:after {
    background: #000000;
    content: "";
    height: 2px;
    left: 0;
    position: absolute;
    top: 0;
    width: 14px;
    transition: transform 500ms ease;
  }
  .plus-minus-toggle-black:after {
    transform-origin: center;
  }
  .plus-minus-toggle-black.collapsed:after {
    transform: rotate(90deg);
  }
  .plus-minus-toggle-black.collapsed:before {
    transform: rotate(180deg);
  }

  /* white background */
  .plus-minus-toggle {
    cursor: pointer;
    height: 21px;
    position: absolute;
    width: 21px;
    top: 50%;
    right: 20px;
  }
  .plus-minus-toggle:before,
  .plus-minus-toggle:after {
    background: #000000;
    content: "";
    height: 2px;
    left: 0;
    position: absolute;
    top: 0;
    width: 14px;
    transition: transform 500ms ease;
  }
  .plus-minus-toggle:after {
    transform-origin: center;
  }
  .plus-minus-toggle.collapsed:after {
    transform: rotate(90deg);
  }
  .plus-minus-toggle.collapsed:before {
    transform: rotate(180deg);
  }
  .collapsible-body {
    display: block;
  }
</style>
