<script>
  import { onMount, afterUpdate } from "svelte";
  import axios from "axios";
  import {
    judgementResult,
    fullJudgementData,
    totalRecords,
    query,
    baseUrl,
    USERNAME,
    PASSWORD,
  } from "../model/store.js";
  import Modal1 from "../utils/Modal1.svelte";
  import {
    calcRT,
    zoomIn,
    zoomOut,
    exportCSV,
  } from "../utils/JudgementHelper.svelte";
  import { deafult } from "../utils/Toast";
  import Tooltip from "../utils/Tooltip.svelte";
  import { tick } from "svelte";
  import { push } from "svelte-spa-router";
  import Mark from "mark.js";
  import Fa from "svelte-fa";
  import { faClock } from "@fortawesome/free-regular-svg-icons";
  import {
    faPrint,
    faHighlighter,
    faCircleArrowDown,
    faMagnifyingGlassPlus,
    faMagnifyingGlassMinus,
  } from "@fortawesome/free-solid-svg-icons";
  $: items = $judgementResult;
  $: headnote = "";
  $: currentPage = 0;
  $: lastPage = $totalRecords - currentPage;

  let results = [];
  let items;
  let countNumber;
  $: sortSelect = "";
  $: filterSelect = "";
  let filterByValue = "";
  let regLink = "";
  let headNoteContainer;
  let headNotePara;
  let tableContainer;
  let readingTime;
  let showModal = false;
  let currentIndex = 0;
  let isloader = false;
  let isDisable = false;
  let fields = "";
  let element;
  let citationClickValue = "";
  let statusCitationClickValue = "";
  localStorage.setItem("clickHeadnote", "false");
  let citationValue = "";
  let headnoteCasesCited = [];
  let petitionerCousnel = "";
  let respondentCousnel = "";

  $: printHeadNoteClass = "";
  $: currentCitation = "";
  let pageSize = 100;
  let clickHeadnoteValue = "";
  let val = false;
  let index = 0;
  let indexValue = 0;
  let sort;
  let filter;
  let status = false;
  let citationClass = "font-bold text-xl mb-2";

  let instance;
  let words;
  let wordArray = [];

  async function queryCount(data) {
    delete data.sort;
    delete data.from;
    delete data.size;
    let countNumber = await axios({
      url: `${baseUrl}/judgement/nearlaw/_count`,
      auth: {
        username: USERNAME,
        password: PASSWORD,
      },
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: data,
    });
    return countNumber;
  }

  async function queryES($query) {
    sortSelect = localStorage.getItem("sort");
    if (sortSelect == "latest") {
      $query.sort = [
        {
          doj_sort: { order: "desc" },
        },
      ];
    } else if (sortSelect == "relevance") delete $query.sort;
    let results = await axios({
      url: `${baseUrl}/judgement/nearlaw/_search`,
      auth: {
        username: USERNAME,
        password: PASSWORD,
      },
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: $query,
    });
    return results;
  }

  async function sortBy(sortByValue) {
    filterByValue = localStorage.getItem("filter");
    if (sortByValue === "relevance") {
      filterBy(filterByValue);
    } else if (sortByValue === "latest") {
      filterBy(filterByValue);
    }
    localStorage.setItem("indexValue", 0);
    localStorage.setItem("sort", sortByValue);
    localStorage.setItem("filter-sort", "true");
  }

  async function filterBy(filterSelect) {
    delete $query.query.bool.must_not;

    if (filterSelect === "print") {
      isloader = true;
      localStorage.setItem("filter", filterSelect);
      let mustNotParams = [
        {
          simple_query_string: {
            query: '("NearLaw" | "ALL SCR (ONLINE"))',
            fields: ["Citation"],
          },
        },
      ];
      $query.query.bool.must_not = mustNotParams;

      countNumber = await queryCount($query);
      $query.from = currentPage;
      $query.size = 100;
      results = await queryES($query);
      $totalRecords = countNumber.data.count;
      items = results.data.hits.hits;
      isloader = false;
    } else if (filterSelect === "all") {
      isloader = true;
      localStorage.setItem("filter", filterSelect);

      countNumber = await queryCount($query);
      $query.from = currentPage;
      $query.size = 100;
      results = await queryES($query);
      $totalRecords = countNumber.data.count;
      items = results.data.hits.hits;
      isloader = false;
    } else {
      isloader = true;
      localStorage.setItem("filter", "all");

      countNumber = await queryCount($query);
      $query.from = currentPage;
      $query.size = 100;
      results = await queryES($query);
      $totalRecords = countNumber.data.count;
      items = results.data.hits.hits;
      isloader = false;
    }
    localStorage.setItem("filter-sort", "true");
    localStorage.setItem("indexValue", 0);
    localStorage.setItem("totalRecords", $totalRecords);
    setHeadnote(items, $query, 0);
  }

  const onPreviousPage = async () => {
    localStorage.setItem("indexValue", 0);
    currentIndex = 0;
    citationClickValue = localStorage.getItem("citationClick");
    if (citationClickValue === "true")
      currentPage = parseInt(localStorage.getItem("currentPage"));
    currentPage -= pageSize;
    localStorage.setItem("currentPage", currentPage);
    isloader = true;

    if (currentPage < 0) {
      deafult("Cannot go to previous page.");
      currentPage = 0;
      localStorage.setItem("currentPage", currentPage);
      isloader = false;
      return false;
    }

    $query.from = currentPage;
    results = await queryES($query);
    items = results.data.hits.hits;
    scrollTopFunction();
    setHeadnote(items, $query, 0);
    isloader = false;
  };

  const onNextPage = async () => {
    localStorage.setItem("indexValue", 0);
    currentIndex = 0;
    citationClickValue = localStorage.getItem("citationClick");
    if (citationClickValue === "true")
      currentPage = parseInt(localStorage.getItem("currentPage"));
    currentPage += pageSize;
    localStorage.setItem("currentPage", currentPage);
    isloader = true;
    $query.from = currentPage;
    results = await queryES($query);
    items = results.data.hits.hits;
    scrollTopFunction();
    setHeadnote(items, $query, 0);
    isloader = false;
  };

  const next = (index) => {
    index++;
    if (index > items.length - 1 && items.length == 100) {
      deafult("Click Next Page");
      return false;
    } else if (lastPage < 100 && index > items.length - 1) {
      deafult("On Last Result");
      return false;
    }
    currentIndex = index;
    setHeadnote(items, $query, currentIndex);
  };

  const previous = (index) => {
    index--;
    currentPage = parseInt(localStorage.getItem("currentPage"));
    if (index < 0 && currentPage != 0) {
      deafult("Click Previous Page");
      return false;
    } else if (currentPage == 0 && index < 0) {
      deafult("On First Result");
      return false;
    }
    currentIndex = index;
    setHeadnote(items, $query, currentIndex);
  };

  async function getLink(citation, parentCitation) {
    localStorage.setItem("casesCitedClick", "true");
    localStorage.setItem("citation", parentCitation);
    element = citation;
    isloader = true;
    let data = {
      query: {
        bool: {
          must: [
            {
              simple_query_string: {
                fields: ["Citation"],
                query: `("${element}")`,
              },
            },
          ],
        },
      },
    };
    let results = await axios({
      url: `${baseUrl}/judgement/nearlaw/_search`,
      auth: {
        username: USERNAME,
        password: PASSWORD,
      },
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: data,
    });
    isloader = false;
    show(results.data.hits.hits[0]._source);
  }

  function addCitationLinks(string) {
    let newStr = "";
    let splitedStringArray = [];
    let newSplitArray = [];
    let newArray = [];
    let str = "";
    const volumes = [
      "ALL SCR \\(ONLINE\\)",
      "ALL SCR",
      "ALL SCR \\(Cri\\)",
      "ALL MR",
      "ALLMR ONLINE",
      "ALL MR \\(SUPREME COURT\\)",
      "ALL MR \\(Cri\\)",
      "ALL MR \\(Cri\\) \\(SUPREME COURT\\)",
      "ALL MR \\(JOURNAL\\)",
      "ALL MR \\(Cri\\) \\(JOURNAL\\)",
      "Nearlaw \\(Mumbai HC\\)",
      "Nearlaw \\(Mumbai HC\\) \\(Cri\\)",
      "Nearlaw \\(Mumbai HC\\) \\(SUPREME COURT\\)",
      "Nearlaw \\(Mumbai HC\\) \\(Cri\\) \\(SUPREME COURT\\)",
      "Nearlaw \\(BombayHC\\) Online",
      "Nearlaw \\(BombayHC Goa\\) Online",
      "Nearlaw \\(BombayHC Nagpur\\) Online",
      "Nearlaw \\(BombayHC Aurangabad\\) Online",
      "Nearlaw \\(DelhiHC\\)",
      "Nearlaw \\(KER\\) Online",
      "Nearlaw \\(KAR\\) Online",
      "Nearlaw \\(GUJ\\) Online",
      "Nearlaw \\(CAL\\) Online",
      "Nearlaw \\(PUN\\) Online",
      "Nearlaw \\(ALH\\) Online",
    ];

    try {
      regLink = new RegExp(
        `([0-9]{4})(\\([0-9]{1}\\))? ((${volumes.join(
          ")|("
        )})) ([0-9]+)( \\(S.C.\\))?`,
        "gm"
      );

      let links = string.match(regLink);
      if (links !== null) {
        for (let i = 0; i < links.length; i++) {
          string = string.replace(links[i], `<a>${links[i]}</a>`);
        }
      }
      string = string.split("\n");
      for (let i = 0; i < string.length; i++) {
        str = string[i].split("<a>");
        splitedStringArray.push(str);
      }

      for (let i = 0; i < splitedStringArray.length; i++) {
        for (let j = 0; j < splitedStringArray[i].length; j++) {
          index = splitedStringArray[i][j];
          if (index.includes("</a>") == true) {
            newStr = index.split("</a>");
            newStr.reverse();
            for (let k = 0; k < newStr.length; k++) {
              newSplitArray.splice(j, 0, newStr[k]);
            }
          } else {
            newStr = index;
            newSplitArray.splice(j, 0, newStr);
          }
        }
        newArray.push(newSplitArray);
        newSplitArray = [];
      }
    } catch (error) {
      console.log(error);
      return string;
    }
    string = newArray;
    return string;
  }

  const onTableClick = (singleJudgementData, index) => {
    // update index
    clickHeadnoteValue = localStorage.getItem("clickHeadnote");
    // localStorage.setItem("clickHeadnote", "false");
    currentIndex = index;
    currentCitation = singleJudgementData.Citation;
    fields = $query.query.bool.must[0].simple_query_string.fields;
    if (fields.length == 2 && clickHeadnoteValue == "false") {
      for (let i = 0; i < fields.length; i++) {
        if (singleJudgementData.hasOwnProperty(`${fields[i]}`)) {
          headnote = singleJudgementData[`${fields[i]}`];
        }
      }
      headnoteCasesCited = addCitationLinks(headnote);
    } else if (fields.length == 2 && clickHeadnoteValue == "true")
      headnote = singleJudgementData.HeadNote;
    else headnote = singleJudgementData.HeadNote;
  };

  const show = (singleJudgementData) => {
    index = getIndex(singleJudgementData.Citation);
    $judgementResult = items;
    $fullJudgementData = singleJudgementData;
    push("/fulljudgement");
  };

  function getIndex(citation) {
    let judgements = items;
    for (index = 0; index < judgements.length; index++) {
      if (judgements[index]["_source"]["Citation"] == citation) {
        if (index > judgements.length) {
          return false;
        }
        return index;
      }
    }
  }
  function scrollTopFunction() {
    window.scrollTo(document.body.scrollHeight, 0);
  }
  function toggleFlag(value) {
    var toggle = value ? false : true;
    return toggle;
  }

  function clickHeadnote() {
    clickHeadnoteValue = localStorage.getItem("clickHeadnote");
    hnv = !Boolean(clickHeadnoteValue);
    if (clickHeadnoteValue == "true") hnv = !hnv;
    newhnv = toggleFlag(hnv);
    localStorage.setItem("clickHeadnote", String(newhnv));
  }

  function setHeadnote(items, data, index) {
    indexValue = localStorage.getItem("indexValue");
    fields = data.query.bool.must[0].simple_query_string.fields;
    clickHeadnoteValue = localStorage.getItem("clickHeadnote");
    if (items.length == 1) {
      index = 0;
    }
    if (
      fields.length == 2 &&
      clickHeadnoteValue == "false" &&
      fields[0].includes("cases") == true
    ) {
      for (let i = 0; i < fields.length; i++) {
        if (items[index]._source.hasOwnProperty(`${fields[i]}`)) {
          headnote = items[index]._source[`${fields[i]}`];
        }
      }
      headnoteCasesCited = addCitationLinks(headnote);
    } else if (
      fields.length == 2 &&
      clickHeadnoteValue == "false" &&
      fields[0].includes("Adv") == true
    ) {
      for (let i = 0; i < fields.length; i++) {
        if (
          items[index]._source.hasOwnProperty(`${fields[0]}`) ||
          items[index]._source.hasOwnProperty(`${fields[1]}`)
        ) {
          petitionerCousnel = items[index]._source[`${fields[0]}`];
          respondentCousnel = items[index]._source[`${fields[1]}`];
        }
      }
    } else {
      if (items[index]._source.hasOwnProperty("HeadNote")) {
        headnote = items[index]._source.HeadNote;
      } else if (items[index]._source.hasOwnProperty("act_statue_name")) {
        headnote = items[index]._source.act_statue_name;
      } else if (items[index]._source.hasOwnProperty("Case_no")) {
        headnote = items[index]._source.Case_no;
      }
    }
    currentCitation = items[index]._source.Citation;
    if ($totalRecords < 100) {
      isDisable = true;
    }
    console.log("Disabled :", isDisable);
  }
  function highlight(isHighlight) {
    if (isHighlight) {
      instance = new Mark(document.getElementById("highlight"));
      words = localStorage.getItem("highlight");
      if (words != null) {
        wordArray = words.split("|");
        wordArray.forEach((e) => {
          instance.mark(e, {
            accuracy: "partially",
            separateWordSearch: false,
          });
        });
      }
    }
  }

  onMount(() => {
    indexValue = localStorage.getItem("indexValue");
    $totalRecords = localStorage.getItem("totalRecords");
    scrollTopFunction();
    if (!items.length) {
      push("/case-search");
    }
    console.log("Items:", items);

    /*
     * Initialize the headnote with First Headnote and Current Index
     */
    currentIndex = 0;

    statusCitationClickValue = localStorage.getItem("statusCitationClick");
    citationValue = localStorage.getItem("citation");
    if (statusCitationClickValue == "true") {
      indexValue = getIndex(citationValue);
      localStorage.setItem("indexValue", indexValue);
    }

    sort = localStorage.getItem("sort");
    filter = localStorage.getItem("filter");
    if (
      $totalRecords > 1 &&
      document.getElementById("relevance-latest") != null &&
      document.getElementById("online-all") != null
    ) {
      if (sort == "relevance") {
        document
          .getElementById("relevance-latest")
          .getElementsByTagName("option")[1].selected = "selected";
      } else if (sort == "latest") {
        document
          .getElementById("relevance-latest")
          .getElementsByTagName("option")[0].selected = "selected";
      }
      if (filter == "all") {
        document
          .getElementById("online-all")
          .getElementsByTagName("option")[0].selected = "selected";
      } else if (filter == "print") {
        document
          .getElementById("online-all")
          .getElementsByTagName("option")[1].selected = "selected";
      }
    }

    citationClickValue = localStorage.getItem("citationClick");
    if (citationClickValue === "true") {
      currentIndex = indexValue;
      if (localStorage.getItem("currentPage") == null) {
        localStorage.setItem("currentPage", currentIndex);
      }
      currentPage = parseInt(localStorage.getItem("currentPage"));
    } else if (currentPage < 0) {
      currentPage = currentIndex;
    } else {
      localStorage.setItem("currentPage", currentIndex);
      localStorage.setItem("indexValue", currentIndex);
      currentPage = currentIndex;
    }
    localStorage.setItem("filter-sort", "false");
    localStorage.setItem("casesCitedClick", "false");
    localStorage.setItem("statusCheckerClick", "false");
    setHeadnote(items, $query, currentIndex);
    readingTime = calcRT(headnote);
  });

  afterUpdate(() => {
    // calculate the reading time
    readingTime = calcRT(headnote);
    instance = new Mark(document.getElementById("highlight"));
    words = localStorage.getItem("highlight");
    if (words != null) {
      wordArray = words.split("|");
      wordArray.forEach((e) => {
        instance.mark(e, { accuracy: "partially", separateWordSearch: false });
      });
    }

    //check if Status
    if (items[currentIndex]["_source"].hasOwnProperty("status")) {
      status = true;
      if (items[currentIndex]["_source"].status.hasOwnProperty("finalStatus")) {
        citationClass =
          "font-bold text-blue-600 underline text-3xl cursor-pointer";
      } else {
        items[currentIndex]["_source"].status.forEach((element) => {
          if (element.statusId) {
            citationClass =
              "font-bold inline-block bg-red-500 text-white px-32 underline text-3xl cursor-pointer";
            return;
          } else {
            citationClass =
              "font-bold inline-block text-blue-600 underline text-3xl cursor-pointer";
          }
        });
      }
    } else {
      status = false;
      citationClass =
        "font-bold text-blue-600 underline text-3xl cursor-pointer";
    }
  });

  const printHeadNote = async () => {
    printHeadNoteClass = "print-headnote";
    showModal = false;
    await tick();
    window.print();
  };

  const noprintHeadNote = async () => {
    printHeadNoteClass = "noprint-headnote";
    showModal = false;
    await tick();
    window.print();
  };
</script>

<div class="container -mt-3 mx-auto">
  <p on:load={() => window.scrollTo(0, 0)} />
  <div class="flex flex-col mx-5">
    <div
      class="mt-5 rounded bg-white border h-64 headnote-scroll"
      id="headnote"
    >
      <div class="p-7">
        <div
          class="py-2 flex flex-row font-serif border-b border-teal-400
          border-dotted headnote-helper"
        >
          <span
            class="flex mx-2 rounded overflow-hidden shadow-lg border-l border-b
            border-r cursor-pointer bg-white text-teal-500"
            on:click={zoomIn(headNoteContainer)}
          >
            <span class="flex my-auto">
              <Fa icon={faMagnifyingGlassPlus} scale={0.5} size="2x" />
            </span>
            <span class="flex my-2 ml-1 mr-3 text-black">Zoom In</span>
          </span>
          <span
            class="flex mx-2 rounded overflow-hidden shadow-lg border-l border-b
            border-r cursor-pointer bg-white text-teal-500"
            on:click={zoomOut(headNoteContainer)}
          >
            <span class="flex my-auto">
              <Fa icon={faMagnifyingGlassMinus} scale={0.5} size="2x" />
            </span>
            <span class="flex my-2 ml-1 mr-3 text-black">Zoom Out</span>
          </span>
          <span
            class="flex mx-2 rounded overflow-hidden shadow-lg border-l border-b
            border-r cursor-pointer bg-white text-teal-500"
            on:click={() => (showModal = true)}
          >
            <span class="flex my-auto">
              <Fa icon={faPrint} scale={0.5} size="2x" />
            </span>
            <span class="flex my-2 ml-1 mr-3 text-black">Print</span>
          </span>
          <span
            class="flex mx-2 rounded overflow-hidden shadow-lg border-l border-b
            border-r cursor-pointer bg-white text-teal-500"
            on:click={() => exportCSV(tableContainer)}
          >
            <span class="flex my-auto">
              <Fa icon={faCircleArrowDown} scale={0.5} size="2x" />
            </span>
            <span class="flex my-2 ml-1 mr-3 text-black">Export CSV</span>
          </span>
          <span
            class="flex mx-2 rounded overflow-hidden shadow-lg border-l border-b
            border-r cursor-pointer bg-white text-teal-500"
          >
            <span class="flex my-auto">
              <Fa icon={faClock} scale={0.5} size="2x" />
            </span>
            <span class="flex my-2 ml-1 mr-3 text-black"
              >{readingTime} min read
            </span>
          </span>

          {#if $totalRecords > 1}
            <span
              class="flex mx-2 rounded overflow-hidden shadow-lg border-l border-b
            border-r cursor-pointer bg-white text-teal-500"
              on:click={highlight}
            >
              <span class="flex my-auto">
                <Fa icon={faHighlighter} scale={0.5} size="2x" />
              </span>
              <span class="flex my-2 ml-1 mr-3 text-black"
                >View Highlight
              </span>
            </span>
            <div class="float-right">
              <!-- svelte-ignore missing-declaration -->
              <select
                bind:value={sortSelect}
                on:change={sortBy(sortSelect)}
                class="shadow border rounded py-2 px-3 text-gray-700
                leading-tight focus:outline-none focus:border-none mr-8 "
                id="relevance-latest"
              >
                <option value="latest">Latest</option>
                <option value="relevance">Relevance</option>
              </select>
              <select
                bind:value={filterSelect}
                on:change={filterBy(filterSelect)}
                class="shadow border rounded py-2 px-3 text-gray-700
                leading-tight focus:outline-none focus:border-none"
                id="online-all"
              >
                <option value="all">All</option>
                <option value="print">Journal Only</option>
              </select>
            </div>
          {/if}
        </div>

        <div bind:this={headNoteContainer} class="headnote-container p-2">
          {#if (headnote, clickHeadnoteValue, headnoteCasesCited)}
            {#if $totalRecords > 1}
              <div class="flex flex-row justify-between">
                <Tooltip>
                  <svg
                    slot="activator"
                    class="h-6 w-8 mr-2 mt-3 fill-current text-teal-500
                    cursor-pointer inline-block"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    on:click={previous(currentIndex)}
                  >
                    <polygon
                      points="3.828 9 9.899 2.929 8.485 1.515 0 10 .707 10.707
                      8.485 18.485 9.899 17.071 3.828 11 20 11 20 9 3.828 9"
                    />
                  </svg>
                  Previous
                </Tooltip>
                <p
                  class={citationClass}
                  on:click={() => show(items[currentIndex]._source)}
                >
                  {currentCitation}
                </p>
                <Tooltip>
                  <svg
                    slot="activator"
                    class="h-6 w-8 mr-2 mt-3 fill-current text-teal-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    on:click={next(currentIndex)}
                  >
                    <polygon
                      points="16.172 9 10.101 2.929 11.515 1.515 20 10 19.293
                      10.707 11.515 18.485 10.101 17.071 16.172 11 0 11 0 9"
                    />
                  </svg>
                  Next
                </Tooltip>
              </div>
            {:else}
              <div class="flex flex-row justify-center">
                <p
                  class={citationClass}
                  on:click={() => show(items[currentIndex]._source)}
                >
                  {currentCitation}
                </p>
              </div>
            {/if}

            <p
              class="text-justify text-gray-800 my-2 mx-2"
              bind:this={headNotePara}
              id="highlight"
            >
              {#if fields.length == 2 && clickHeadnoteValue == "false" && fields[0].includes("cases") == true}
                <b>
                  {#each headnoteCasesCited as element}
                    {#each element as el}
                      {#if el.length > 1}
                        {#if element.indexOf(el) == 0}
                          <span class="text-black inline">
                            {@html el.replace(/\n/g, "<br>")}
                          </span>
                        {/if}

                        {#if element.indexOf(el) == 1}
                          <span
                            style="cursor:pointer;"
                            class="links text-black underline inline"
                            on:click={() =>
                              getLink(el, items[currentIndex]._source.Citation)}
                          >
                            {@html el.replace(/\n/g, "<br>")}
                          </span>
                        {/if}

                        {#if element.indexOf(el) == 2}
                          <span class="text-black inline">
                            {@html el.replace(/\n/g, "<br>")}
                          </span>
                        {/if}
                      {/if}
                    {/each}
                    <br />
                  {/each}
                </b>
              {:else if fields.length == 2 && clickHeadnoteValue == "true"}
                <b>
                  {@html headnote.replace(/\n/g, "<br>")}
                </b>
              {:else if fields.length == 2 && clickHeadnoteValue == "false" && (fields[0].includes("Adv") == true || fields[1].includes("Adv") == true)}
                <b>
                  {#if petitionerCousnel}
                    <div>Petitioner Counsel</div>
                    <div>
                      {@html petitionerCousnel}
                    </div>
                  {/if}
                  {#if respondentCousnel}
                    <div>Respondent Counsel</div>
                    <div>
                      {@html respondentCousnel}
                    </div>
                  {/if}
                </b>
              {:else}
                <b>
                  {@html headnote.replace(/\n/g, "<br>")}
                </b>
              {/if}
            </p>
          {/if}
        </div>
      </div>
    </div>
    <!-- <div bind:this={headNoteContainer} class="headnote-container p-2"> -->
    <div class="table-container" bind:this={tableContainer}>
      {#if $totalRecords > 1}
        <div class="flex flex-row bg-green-500 justify-between my-2">
          {#if currentPage == 0}
            <p class="p-2 mx-3 text-green-500" disabled={isDisable}>
              Previous Page
            </p>
          {:else}
            <p
              class="p-2 mx-3 underline italic text-white cursor-pointer"
              disabled={isDisable}
              on:click={() => onPreviousPage()}
            >
              Previous Page
            </p>
          {/if}
          <h3 class="text-center font-bold text-white text-2xl cursor-pointer">
            TOTAL RESULTS : {$totalRecords}
          </h3>
          {#if lastPage < 100}
            <p class="p-2 mx-3 text-green-500" disabled={isDisable}>
              Next Page
            </p>
          {:else}
            <p
              class="p-2 mx-3 underline italic text-white cursor-pointer"
              disabled={isDisable}
              on:click={() => onNextPage()}
            >
              Next Page
            </p>
          {/if}
          {#if isloader}
            <div class="loader" />
          {/if}
        </div>
      {:else}
        <div class="bg-green-500 my-2">
          <h3 class="text-center font-bold text-white text-2xl cursor-pointer">
            TOTAL RESULTS : {$totalRecords}
          </h3>
        </div>
      {/if}
    </div>
    <!-- made the h-64 scroll h-auto to make lower result portion without scrollbar, removed border
    table-scroll, overflow-auto and table-scroll -->
    <div class="rounded h-full shadow-lg bg-white border table-scroll">
      <div class="table-container" bind:this={tableContainer}>
        <table class="table w-full">
          <!-- <caption class="bg-green-500 text-white text-2xl"><h3>Total Records : {$totalRecords}</h3></caption> -->
          <thead>
            <tr>
              <th class="px-4 py-2">No</th>
              <th class="px-4 py-2">Citation</th>
              <th class="px-4 py-2">Petitioner</th>
              <th class="px-4 py-2">Respondent</th>
              <th class="px-4 py-2">Court Name</th>
              <th class="px-4 py-2">HeadNote</th>
              <th class="px-4 py-2">Full Judgement</th>
            </tr>
          </thead>
          <tbody>
            {#each items as jTable, index}
              <tr
                class={currentCitation === jTable._source.Citation
                  ? "bg-teal-200"
                  : "bg-white"}
              >
                <td
                  class="border px-4 py-2"
                  on:click={() =>
                    onTableClick(jTable._source, index) & scrollTopFunction()}
                >
                  {index + currentPage + 1}
                </td>
                <td
                  class="border px-4 py-2"
                  on:click={() =>
                    onTableClick(jTable._source, index) & scrollTopFunction()}
                >
                  {@html jTable._source.Citation}
                </td>
                <td
                  class="border px-4 py-2"
                  on:click={() =>
                    onTableClick(jTable._source, index) & scrollTopFunction()}
                >
                  {@html jTable._source.Petitioner}
                </td>
                <td
                  class="border px-4 py-2"
                  on:click={() =>
                    onTableClick(jTable._source, index) & scrollTopFunction()}
                >
                  {@html jTable._source.Respondent}
                </td>
                <td
                  class="border px-4 py-2"
                  on:click={() =>
                    onTableClick(jTable._source, index) & scrollTopFunction()}
                >
                  {@html jTable._source.tribunal}
                </td>
                <td>
                  <button
                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold
                    py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                    type="button"
                    on:click={() =>
                      clickHeadnote() &
                      onTableClick(jTable._source, index) &
                      scrollTopFunction()}
                  >
                    HeadNote
                  </button>
                </td>
                <td>
                  <button
                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold
                    py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                    type="button"
                    on:click={() => show(jTable._source)}
                  >
                    Judgement
                  </button>
                </td>
              </tr>
              <tr class="{printHeadNoteClass} hidden">
                <td colspan="5" class="p-3">{jTable._source.HeadNote}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
    {#if $totalRecords > 1}
      <div class="flex flex-row bg-green-500 justify-between my-2">
        {#if currentPage == 0}
          <p class="p-2 mx-3 text-green-500" disabled={isDisable}>
            Previous Page
          </p>
        {:else}
          <p
            class="p-2 mx-3 underline italic text-white cursor-pointer"
            disabled={isDisable}
            on:click={() => onNextPage()}
          >
            Previous Page
          </p>
        {/if}
        <h3 class="text-center font-bold text-white text-2xl cursor-pointer">
          TOTAL RESULTS : {$totalRecords}
        </h3>
        {#if lastPage < 100}
          <p class="p-2 mx-3 text-green-500" disabled={isDisable}>Next Page</p>
        {:else}
          <p
            class="p-2 mx-3 underline italic text-white cursor-pointer"
            disabled={isDisable}
            on:click={() => onNextPage()}
          >
            Next Page
          </p>
        {/if}
        {#if isloader}
          <div class="loader" />
        {/if}
      </div>
    {:else if $totalRecords == 1}
      <!-- <div class="bg-green-500 my-2">
        <h3 class="text-center font-bold text-white text-2xl cursor-pointer">
          TOTAL RESULTS : {$totalRecords}
        </h3>
      </div> -->
    {/if}
  </div>
</div>
{#if showModal}
  <Modal1 on:close={() => (showModal = false)}>
    <h2 slot="header" class="text-2xl">Which option to print the results?</h2>
    <div class="flex flex-row items-center justify-between mt-5">
      <button
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4
        rounded focus:outline-none focus:shadow-outline"
        type="button"
        on:click={printHeadNote}
      >
        Print with Headnotes
      </button>
      <button
        class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4
        rounded focus:outline-none focus:shadow-outline"
        type="button"
        on:click={noprintHeadNote}
      >
        Print Citation List Only
      </button>
    </div>
  </Modal1>
{/if}

<style>
  .on-scrollbar,
  #headnote {
    scrollbar-width: auto;
    -ms-overflow-style: none;
  }

  .on-scrollbar::-webkit-scrollbar-track,
  #headnote::-webkit-scrollbar-track {
    -webkit-box-shadow: none !important;
    background-color: transparent !important;
  }

  .on-scrollbar::-webkit-scrollbar,
  #headnote::-webkit-scrollbar {
    width: 12px !important;
    background-color: transparent;
  }

  .on-scrollbar::-webkit-scrollbar-thumb,
  #headnote::-webkit-scrollbar-thumb {
    background-color: #acacac;
  }

  #headnote {
    resize: both !important;
    overflow-y: scroll;
  }

  @media print {
    .headnote-scroll {
      display: none;
    }
    .show-judgement {
      display: none;
    }
    .table-scroll {
      width: 100%;
      height: 100%;
      margin-right: 5%;
      margin-left: -1%;
    }
    .table-print {
      border-right: 1px;
      display: visible;
      width: auto;
      height: auto;
      overflow: visible;
    }
    .print-headnote {
      display: contents;
    }
    .noprint-headnote {
      display: none;
    }
  }
  .highlight {
    background-color: yellow;
  }
</style>
