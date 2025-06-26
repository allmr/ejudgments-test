<script>
  import Mark from "mark.js";
  import { success, failure } from "../utils/Toast";
  import { createEventDispatcher } from "svelte";
  export let jContainer;
  import { findWords } from "../model/store.js";
  const dispatch = createEventDispatcher();

  let name = "";
  let words = [];
  function find() {
    let text = document.getElementById("input").value;
    if (text.length != 0) {
      text = text.trim();
      mark(text);
    } else {
      failure("Insert some text");
    }
  }

  function mark(text) {
    let instance = new Mark(jContainer);
    instance.unmark({
      done: function (counter) {},
    });
    let message = "";
    if (text != null) {
      instance.mark(text, {
        accuracy: "exactly",
        separateWordSearch: false,
        done: function (counter) {
          if (counter != 0) {
            words.push(text);
            words = words;
            $findWords = words;
            message = `${counter} matches found!!!`;
            success(message);
          }
        },
        noMatch: function (range) {
          failure("No matches found");
        },
      });
    }
  }
</script>

<div>
  <input
    type="text"
    name=""
    id="input"
    class="w-10/12 text-gray-700 rounded py-2 px-4 leading-tight border-2
    border-gray-700 focus:outline-none focus:border-blue-700"
    bind:value={name}
    placeholder="Enter text to find"
  />
  <button
    class="p-2 mx-3 rounded overflow-hidden shadow-lg border-l border-b border-r
    cursor-pointer bg-white"
    on:click={find}
  >
    Find
  </button>
</div>
<div>
  {#each words as word}
    <button
      class="rounded mr-4 mt-1 focus:outline-none cursor-pointer bg-blue-500 text-white px-2 py-1 font-bold"
      on:click={() => mark(word)}>{word}</button
    >
  {/each}
</div>

<style>
</style>
