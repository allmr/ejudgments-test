<script>
  import { onMount } from "svelte";
  import { get } from "svelte/store";
  import Router from "svelte-spa-router";
  import { link, wrap, replace } from "svelte-spa-router";
  import { SvelteToast } from "@zerodevx/svelte-toast";
  import axios from 'axios';

  // Components
  import Tailwindcss from "./Tailwindcss.svelte";
  import Home from "./routes/Home.svelte";
  import CaseSearch from "./routes/CaseSearch.svelte";
  import IndexSearch from "./routes/IndexSearch.svelte";
  import UpdatedCitations from "./routes/UpdatedCitations.svelte";
  import support from "./routes/support.svelte";
  import JudgementInfo from "./routes/JudgementInfo.svelte";
  import FullJudgement from "./routes/FullJudgement.svelte";
  import citationMap from "./routes/citationMap.svelte";
  import statusChecker from "./routes/statusChecker.svelte";
  import BackButton from "./component/Backbutton.svelte";
  import pdf from "./routes/pdfviewer.svelte";

  // Stores
  import {
    judgementResult,
    fullJudgementData,
    advocateName,
    mobileNumber,
    userDetails
  } from "./model/store.js";

  // App state
  let showMobileMenu = false;
  let color;
  let appInitialized = false;

  // Basic Auth credentials
  const auth = {
    username: 'ALLMRONLINE_AUTH',
    password: '4T9X3P7QZ6L1B8V5'
  };

  // Extract and validate query parameters (required like JWT tokens)
  function extractAndValidateQueryParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');
    const mobile = urlParams.get('mobile');
    
    // Both username and mobile are required - redirect if missing
    if (!username || !mobile) {
      console.log("Missing required authentication parameters");
      window.location.href = "https://ejudgments.com:";
      return false;
    }
    
    // Store valid parameters
    advocateName.set(username);
    mobileNumber.set(mobile);
    
    // Store user details in PouchDB
    userDetails.post({
      _id: "user",
      name: username,
      mobile: mobile,
    }).then(() => {
      console.log("User details stored from query params");
      checkPremiumStatus();
    }).catch(err => {
      console.error("Error storing user details:", err);
    });
    
    return true;
  }

  // Load existing user details from PouchDB (fallback only)
  async function loadExistingUserDetails() {
    try {
      const data = await userDetails.find({
        selector: { _id: "user" }
      });
      
      if (data.docs.length > 0) {
        advocateName.set(data.docs[0].name);
        mobileNumber.set(data.docs[0].mobile);
        checkPremiumStatus();
        return true;
      }
    } catch (error) {
      console.error("Error loading user details:", error);
    }
    
    // No existing user data found - redirect to login
    console.log("No existing user data found");
    window.location.href = "https://ejudgments.com:";
    return false;
  }

  // Check premium status
  const checkPremiumStatus = async () => {
    const mobile = get(mobileNumber);
    if (!mobile) return;

    try {
      const response = await axios.post('https://ejudgments.com:4999/svelte/checkPremium', {
        mobile_number: mobile
      }, { auth });
      
      if (response.status !== 200) {
        window.location.href = `https://ejudgments.com:`;
      } else {
        console.log("Premium status check successful.");
      }
    } catch (error) {
      console.error("Error checking premium status:", error);
      window.location.href = `https://ejudgments.com:`;
    }
  };

  // Initialize app with required authentication
  async function initializeApp() {
    // First check for required query parameters (like JWT tokens)
    const hasValidAuth = extractAndValidateQueryParams();
    
    // If no valid query params, try to load from PouchDB as fallback
    if (!hasValidAuth) {
      await loadExistingUserDetails();
      // loadExistingUserDetails will redirect if no data found
      return;
    }
    
    appInitialized = true;
  }

  // Router configuration
  const routing = {
    "/case-search": CaseSearch,
    "/indexsearch": IndexSearch,
    "/judgement": wrap(JudgementInfo, () => {
      removeActiveClass();
      return $judgementResult.length > 0;
    }),
    "/fullJudgement": wrap(FullJudgement, () => {
      removeActiveClass();
      return $fullJudgementData !== null && $fullJudgementData !== undefined;
    }),
    "/show-pdf": pdf,
    "/citationMap": citationMap,
    "/statusChecker": statusChecker,
    "/support": support,
    "/": Home,
    "/updated": UpdatedCitations,
  };

  const failedCodition = () => {
    replace("/case-search");
  };

  // Routes configuration - THIS WAS MISSING THE DECLARATION
  const routes = {
    home: { path: "/", title: "HOME" },
    browse: { path: "/case-search", title: "BROWSE" },
    caseSearch: { path: "/case-search", title: "CASE SEARCH" },
    indexSearch: { path: "/indexsearch", title: "INDEX SEARCH" },
    citationMap: { path: "/citationMap", title: "CITATION MAP" },
    statusChecker: { path: "/statusChecker", title: "STATUS CHECKER" },
    support: { path: "/support", title: "SUPPORT" },
    updated: { path: "/updated", title: "UPDATED CITATIONS" },
  };

  // Helper functions
  function removeActiveClass() {
    try {
      const activeEl = document.getElementsByClassName("active")[0];
      if (activeEl) activeEl.classList.remove("active");
    } catch (err) {
      console.log(err);
    }
  }

  function toggleClass(event) {
    removeActiveClass();
    const elementText = event.target.innerHTML;
    if (elementText !== "BROWSE") {
      event.target.classList.add("active");
    }
  }

  function setTheme(backgroundColor, colorName) {
    document.body.style.backgroundColor = backgroundColor;
    localStorage.setItem("color", colorName);
  }

  function changeBackgroundColor(colorName) {
    const colorMap = {
      SkyBlue: "rgba(191, 216, 254)",
      BeigeClassic: "rgba(238, 232, 170, 1)",
      GoldenYellow: "rgba(255, 250, 205, 1)",
      Orange: "rgba(255,185,56,1)",
      LightCyan: "rgba(224, 255, 255, 1)",
      PowderBlue: "rgba(255,183,51,1)",
      Lime: "rgba(159, 224, 102, 1)"
    };
    
    const backgroundColor = colorMap[colorName] || colorMap.SkyBlue;
    setTheme(backgroundColor, colorName);
  }

  function clearDataAndLogout() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "https://ejudgments.com/";
  }

  // Initialize on mount
  onMount(async () => {
    // Clean up storage
    localStorage.removeItem("startDate");
    
    // Set theme
    color = localStorage.getItem("color") || "SkyBlue";
    changeBackgroundColor(color);
    
    // Initialize app with user data
    await initializeApp();
    
    // Start periodic premium status check (once a day)
    setInterval(checkPremiumStatus, 86400000); // 24 hours
  });
</script>

<svelte:head />

<!-- Only render router after app is initialized -->
{#if appInitialized}
  <Tailwindcss />

  <nav id="nav">
    <div class="inner">
      <ul class="navbar-list fixed flex flex-wrap justify-between">
        <li class="mt-2">
          <BackButton />
        </li>
        <li>
          <a href={routes.home.path} use:link on:click={toggleClass}
            >{routes.home.title}</a
          >
        </li>
        <div class="browsedropdown my-auto">
          <button class="browsedropbtn py-1" on:click={toggleClass}
            >{routes.browse.title}</button
          >
          <div class="browsedropdown-content">
            <div class="browsedropdownbutton">
              <a href={routes.citationMap.path} use:link
                >{routes.citationMap.title}</a
              >
            </div>
          </div>
        </div>
        <li>
          <a href={routes.caseSearch.path} use:link on:click={toggleClass}
            >{routes.caseSearch.title}</a
          >
        </li>
        <li>
          <a href={routes.indexSearch.path} use:link on:click={toggleClass}
            >{routes.indexSearch.title}</a
          >
        </li>
        <li>
          <a href={routes.statusChecker.path} use:link on:click={toggleClass}
            >{routes.statusChecker.title}</a
          >
        </li>
        <li>
          <a href={routes.support.path} use:link on:click={toggleClass}
            >{routes.support.title}</a
          >
        </li>

        <!-- Theme Button -->
        <div class="dropdown mx-2 my-auto">
          <button class="dropbtn px-4 py-1">Theme</button>
          <div class="dropdown-content">
            <div class="pl-2 my-2">
              <span id="LightCyan" class="px-2 inline border-black border-2">0</span>
              <button
                class="inline text-black"
                on:click={() => changeBackgroundColor("LightCyan")}
              >
                Light Cyan
              </button>
            </div>

            <div class="pl-2 my-2">
              <span id="SkyBlue" class="px-2 inline border-black border-2">0</span>
              <button
                class="inline text-black"
                on:click={() => changeBackgroundColor("SkyBlue")}
              >
                Sky Blue
              </button>
            </div>

            <div class="pl-2 my-2">
              <span id="GoldenYellow" class="px-2 inline border-black border-2">0</span>
              <button
                class="inline text-black"
                on:click={() => changeBackgroundColor("GoldenYellow")}
              >
                Golden Yellow
              </button>
            </div>

            <div class="pl-2 my-2">
              <span id="BeigeClassic" class="px-2 inline border-black border-2">0</span>
              <button
                class="inline text-black"
                on:click={() => changeBackgroundColor("BeigeClassic")}
              >
                Beige Classic
              </button>
            </div>

            <div class="pl-2 my-2">
              <span id="Orange" class="px-2 inline border-black border-2">0</span>
              <button
                class="inline text-black"
                on:click={() => changeBackgroundColor("Orange")}
              >
                Orange
              </button>
            </div>

            <div class="pl-2 my-2">
              <span id="Lime" class="px-2 inline border-black border-2">0</span>
              <button
                class="inline text-black"
                on:click={() => changeBackgroundColor("Lime")}
              >
                Lime
              </button>
            </div>
          </div>
        </div>

        <!-- Logout Button -->
        <button
          id="update"
          data-username={$advocateName}
          data-mobile={$mobileNumber}
          class="browsedropbtn"
          on:click={clearDataAndLogout}
        >
          Logout
        </button>

      </ul>
    </div>
  </nav>

  <SvelteToast options={{ reversed: true, intro: { y: 250 } }} />
  <Router routes={routing} on:conditionsFailed={failedCodition} />
{:else}
  <!-- Loading state -->
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-lg">Loading...</div>
  </div>
{/if}


<style>
  nav {
    font-family: "Helvetica Neue", "Helvetica", "Arial", sans-serif;
    padding-bottom: 4em;
    margin-bottom: 2em;
  }

  .navbar-list {
    display: none;
    background-color: white;
    width: 100%;
    margin: auto 0;
    padding: 1em 0;
    justify-content: space-between;
    border-bottom: dotted 2px black;
  }

  .navbar-list li {
    list-style-type: none;
    position: relative;
  }

  .navbar-list a {
    color: rgb(107 114 128);
    text-decoration: none;
    display: flex;
    height: 45px;
    align-items: center;
    font-size: 17px;
    font-weight: bold;
  }

  .navbar-list a:hover,
  .browsedropbtn:hover {
    color: rgb(59 130 246);
  }

  @media only screen {
    .navbar-list {
      display: flex;
    }

    .navbar-list a {
      display: inline-flex;
    }
  }

  .browsedropbtn {
    color: rgb(107 114 128);
    text-decoration: none;
    display: flex;
    height: 45px;
    align-items: center;
    padding: 0 10px;
    font-size: 17px;
    font-weight: bold;
    width: 6em;
  }

  .browsedropbtn:focus,
  .browsedropbtn:active {
    outline: none;
  }

  .browsedropdown {
    position: relative;
    width: 6em;
    display: inline-block;
  }

  .browsedropdown-content {
    display: none;
    position: absolute;
    width: 12em;
    text-align: center;
    margin-left: -2em;
  }

  .browsedropdownbutton {
    font-size: 1em !important;
    border-top: solid 2px black;
  }
  /* Show the dropdown menu on hover */
  .browsedropdown:hover .browsedropdown-content {
    background-color: rgba(255, 255, 255, 1);
    display: block;
  }

  /* The container <div> - needed to position the dropdown content */
  .dropdown {
    position: relative;
    width: 9em;
    display: inline-block;
  }

  /* Style The Dropdown Button */
  .dropbtn {
    background-color: #ffffff;
    color: rgb(107 114 128);
    font-size: 16px;
    font-weight: bold;
    width: 9em;
    border: 1px solid gray;
    border-radius: 5px;
    cursor: pointer;
  }

  /* Dropdown Content (Hidden by Default) */
  .dropdown-content {
    display: none;
    position: absolute;
    width: 9em;
    z-index: 1;
  }

  /* Show the dropdown menu on hover */
  .dropdown:hover .dropdown-content {
    background-color: rgba(255, 255, 255, 1);
    display: block;
  }

  .btn {
    @apply font-bold px-4 rounded;
  }

  .btn-blue {
    @apply bg-blue-700 text-white;
  }

  .btn-blue:hover {
    @apply bg-blue-700;
  }

  @media print {
    nav {
      display: none;
    }
  }
  #SkyBlue {
    border-radius: 100%;
    color: rgba(191, 219, 254, 1);
    background-color: rgba(191, 219, 254, 1);
  }

  #BeigeClassic {
    border-radius: 100%;
    color: rgba(238, 232, 170, 1);
    background-color: rgba(238, 232, 170, 1);
  }

  #GoldenYellow {
    border-radius: 100%;
    color: rgba(255, 250, 205, 1);
    background-color: rgba(255, 250, 205, 1);
  }

  #Orange {
    border-radius: 100%;
    color: rgba(255, 185, 56, 1);
    background-color: rgba(255, 185, 56, 1);
  }

  #LightCyan {
    border-radius: 100%;
    color: rgba(224, 255, 255, 1);
    background-color: rgba(224, 255, 255, 1);
  }

  #Lime {
    border-radius: 100%;
    color: rgba(132, 255, 91, 1);
    background-color: rgba(132, 255, 91, 1);
  }
</style>
