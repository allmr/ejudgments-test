<script>
  import { onMount } from "svelte";
  
  // Components
  import Bookmark from "./Bookmark.svelte";
  import Anotations from "./Anotations.svelte";
  import History from "./History.svelte";
  
  // Stores - these will always have values due to App.svelte authentication
  import { advocateName, mobileNumber } from "../model/store.js";

  // No need for modal or user input - authentication is handled at app level
  onMount(() => {
    console.log(`Welcome ${$advocateName} (${$mobileNumber})`);
  });
</script>

<div class="container mx-auto" id="home">
  <div class="flex mb-4">
    <!-- Bookmarks Column -->
    <div class="w-1/2">
      <div class="max-w-sm rounded overflow-hidden">
        <div class="px-6 py-4">
          <div class="font-bold text-2xl mb-2">My Bookmarks</div>
        </div>
        <Bookmark />
      </div>
    </div>

    <!-- Annotations Column -->
    <div class="w-1/2">
      <div class="max-w-sm rounded overflow-hidden">
        <div class="px-6 py-4">
          <div class="font-bold text-2xl mb-2">My Annotations</div>
        </div>
        <Anotations />
      </div>
    </div>
  </div>
</div>

<style>
  #home {
    margin: 1em 2em 0 2em;
    display: flex;
    flex-direction: column;
  }

  @media only screen and (min-device-width: 1024px) and (max-device-width: 1280px) {
    #home {
      margin: 1em 0 0 0.5em;
    }
  }
</style>