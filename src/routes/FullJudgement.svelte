<script>
  import { onMount, tick, afterUpdate } from "svelte";
  import axios from "axios";
  import {
    advocateName,
    fullJudgementData,
    baseUrl,
    query,
    bookmark_db,
    anotation_db,
    judgementResult,
    dark,
    USERNAME,
    PASSWORD,
    findWords,
    previousEvent,
  } from "../model/store.js";
  import { push } from "svelte-spa-router";
  import HeadNote from "./HeadNote.svelte";
  import CasesCited from "./CasesCited.svelte";
  import JudgementC from "./Judgement.svelte";
  import Mark from "mark.js";
  import Modal from "./Modal.svelte";
  import Content from "./Content.svelte";
  import Find from "./Find.svelte";
  import { success, failure, deafult } from "../utils/Toast";
  import Statuscontent from "./statusContent.svelte";
  import Equivalentcontent from "./EquivalentContent.svelte";
  import { calcRT, zoomIn, zoomOut } from "../utils/JudgementHelper.svelte";
  import Fa from "svelte-fa";
  import { mobileNumber } from "../model/store.js";
  import {
    faBookmark,
    faFilePdf,
    faClock,
  } from "@fortawesome/free-regular-svg-icons";
  import {
    faPrint,
    faCircleHalfStroke,
    faMagnifyingGlassPlus,
    faMagnifyingGlassMinus,
    faArrowLeft,
    faArrowRight,
    faDeleteLeft,
  } from "@fortawesome/free-solid-svg-icons";

  // Reactive statements - add these at the top of your script section
  $: Judgement = $fullJudgementData;
  $: items = $judgementResult;
  
  // Watch for changes in Judgement.Citation and trigger annotation search
  $: if (Judgement.Citation) {
    searchAnnotation(Judgement.Citation);
  }
  
  // Watch for changes in annotation state
  $: console.log('Annotation state changed:', { isAnnotated, text });

  let readingTime;
  let judgementContainer;
  let showModal = false;
  let isAnnotated = false;
  let items;
  let isBookmarked = false;
  let status = false;
  let text = "";
  let filterSortValue = "";
  let casesCitedClickValue = "";
  let statusCheckerClickValue = "";
  let equivalentCitationClickValue = "";
  let statusCitationClickValue = "";
  let indexValue = 0;
  let citation = "";
  let index = 0;
  let jContainer;
  let pageSize = 100;
  let wordsdata = [];
  $findWords = [];
  const allMrLogo = "img/ONLINE-LOGO-CL.jpg";

  const statusIdArray = [
    1, 7, 12, 13, 14, 16, 19, 20, 23, 32, 33, 34, 36, 37, 38, 39, 41, 42, 43,
    44, 45, 46, 47, 48, 49,
  ];
  let citationClass = "font-bold text-xl mb-2";

const AUTH_HEADER = {
  headers: {
    "Content-Type": "application/json",
    Authorization: "Basic QUxMTVJPTkxJTkVfQVVUSDo0VDlYM1A3UVo2TDFCOFY1"
  }
};

//Add new Bookmark
const addBookMark = async (Citation) => {
  try {
    let response = await axios.post(
      `https://ejudgments.com:4999/api/bookmark/${$mobileNumber}/`,
      { citation: Citation },
      AUTH_HEADER
    );

    if (response.status === 201) {
      success("Bookmark added");
      isBookmarked = true;
    }
    else if (response.status === 409) {
      failure("Bookmark already added, Click Home to check Bookmarks");
    }
  } catch (err) {
    console.log(err);
    failure("Something went wrong");
  }
};

// Delete bookmark
const deleteBookmark = async (Citation) => {
  try {
    let response = await axios.delete(
      `https://ejudgments.com:4999/api/bookmark/${$mobileNumber}/`,
      {
        ...AUTH_HEADER,
        data: { citation: Citation }
      }
    );

    if (response.status === 200) {
      success("Bookmark removed");
      isBookmarked = false; // Add this line to update UI state
    }
  } catch (err) {
    console.log(err);
    failure("Something went wrong");
  }
};

//Search specific Bookmark
const searchBookmark = async (Citation) => {
  try {
    let response = await axios.post(
      `https://ejudgments.com:4999/api/bookmarkSearch/${$mobileNumber}/`,
      { citation: Citation },
      AUTH_HEADER
    );

    if (response.status === 200 && response.data) {
      isBookmarked = true;
    } else {
      isBookmarked = false;
    }
  } catch (err) {
    console.log(err);
    isBookmarked = false;
  }
};

//Search Annotation 
const searchAnnotation = async (Citation) => {
  try {
    let response = await axios.post(
      `https://ejudgments.com:4999/api/annotationSearch/${$mobileNumber}/`,
      { citation: Citation },
      AUTH_HEADER
    );

    if (response.status === 200 && response.data) {
      isAnnotated = true;
      text = response.data.annotation || "";
    } else {
      isAnnotated = false;
      text = "";
    }
  } catch (err) {
    console.log(err);
    isAnnotated = false;
    text = "";
  }
};

//Add anotation
const addAnnotation = async (Citation, annotation) => {
  try {
    let response = await axios.post(
      `https://ejudgments.com:4999/api/annotation/${$mobileNumber}/`,
      { citation: Citation, annotation: annotation },
      AUTH_HEADER
    );

    if (response.status === 201) {
      success("Annotation added");
      isAnnotated = true;
      text = annotation;
    }
  } catch (err) {
    console.log(err);
    failure("Something went wrong while adding annotation");
  }
};

//Edit annotation
const editAnnotation = async (Citation, annotation) => {
  try {
    let response = await axios.put(
      `https://ejudgments.com:4999/api/annotation/${$mobileNumber}/`,
      { citation: Citation, annotation: annotation },
      AUTH_HEADER
    );

    if (response.status === 200) {
      success("Annotation updated");
      isAnnotated = true;
      text = annotation;
    }
  } catch (err) {
    console.log(err);
    failure("Something went wrong while updating annotation");
  }
};

//Delete Annotation
//Delete Annotation - FIXED URL
const deleteAnnotation = async (Citation) => {
  try {
    let response = await axios.delete(
      `https://ejudgments.com:4999/api/annotation/${$mobileNumber}/`,
      {
        ...AUTH_HEADER,
        data: { citation: Citation }
      }
    );

    if (response.status === 200) {
      success("Annotation deleted");
      isAnnotated = false;
      text = "";
    }
  } catch (err) {
    console.log(err);
    failure("Something went wrong while deleting annotation");
  }
};

  onMount(() => {
    wordsdata = $findWords;
    if (!Object.keys(Judgement).length) {
      //Object is empty
      push("/case-search");
    }
    localStorage.setItem("equivalentCitationClick", "false");
    localStorage.setItem("citationClick", "true");
    statusCheckerClickValue = localStorage.getItem("statusCheckerClick");
    filterSortValue = localStorage.getItem("filter-sort");
    if (filterSortValue == "true") {
      indexValue = 0;
      $fullJudgementData = getJudgement(indexValue);
      localStorage.setItem("indexValue", indexValue);
      localStorage.setItem("filter-sort", "false");
    } else if (statusCheckerClickValue == "true") {
      indexValue = 0;
      localStorage.setItem("indexValue", indexValue);
    } else {
      indexValue = getIndex(Judgement.Citation);
      localStorage.setItem("indexValue", indexValue);
    }

    statusCitationClickValue = localStorage.getItem("statusCitationClick");

    //bookmark
    searchBookmark(Judgement.Citation);

    //annotation - REPLACED WITH API CALL
    searchAnnotation(Judgement.Citation);
    
    // Add event listener for annotation updates
    const handleAnnotationUpdate = (event) => {
      const { citation, annotation, isAnnotated: annotated } = event.detail;
      if (citation === Judgement.Citation) {
        text = annotation;
        isAnnotated = annotated;
      }
    };
    window.addEventListener('annotationUpdated', handleAnnotationUpdate);

    // Don't forget to clean up the event listener
    const cleanup = () => {
      window.removeEventListener('annotationUpdated', handleAnnotationUpdate);
    };
    
    if (Judgement.hasOwnProperty("status")) {
      status = true;
      if (Judgement.status.hasOwnProperty("finalStatus")) {
        citationClass = "font-bold mb-2";
      } else {
        Judgement.status.forEach((element) => {
          if (statusIdArray.includes(element.statusId)) {
            citationClass = "font-bold mb-2 bg-red-500 text-white";
            return;
          } else {
            citationClass = "font-bold mb-2";
          }
        });
      }
    }
    try {
      readingTime = calcRT(Judgement.judgement);
    } catch (error) {
      console.log(error);
    }
    jContainer = document.getElementById("highlight").innerHTML;

    // Return cleanup function
    return cleanup;
  });

///
afterUpdate(() => {
  wordsdata = $findWords;
  scrollUp(); // to scroll up
  $fullJudgementData = Judgement;
  statusCitationClickValue = localStorage.getItem("statusCitationClick");
  statusCheckerClickValue = localStorage.getItem("statusCheckerClick");
  casesCitedClickValue = localStorage.getItem("casesCitedClick");
  if (statusCitationClickValue != "true" && casesCitedClickValue != "true") {
    localStorage.setItem("citation", Judgement.Citation);
  }

  filterSortValue = localStorage.getItem("filter-sort");
  equivalentCitationClickValue = localStorage.getItem(
    "equivalentCitationClick"
  );
  if (filterSortValue == "true") {
    indexValue = 0;
    $fullJudgementData = getJudgement(indexValue);
    localStorage.setItem("indexValue", indexValue);
    localStorage.setItem("filter-sort", "false");
  } else if (casesCitedClickValue == "true") {
    citation = localStorage.getItem("citation");
    indexValue = getIndex(citation);
    localStorage.setItem("indexValue", indexValue);
  } else if (equivalentCitationClickValue == "true") {
    indexValue = getIndex(Judgement.Citation);
    localStorage.setItem("indexValue", indexValue);
  } else if (statusCheckerClickValue == "true") {
    indexValue = 0;
    localStorage.setItem("indexValue", indexValue);
  } else {
    indexValue = getIndex(Judgement.Citation);
    localStorage.setItem("indexValue", indexValue);
  }
  // Update Annotation - REPLACED WITH API CALL
  searchAnnotation(Judgement.Citation);

  // Update Bookmark
      searchBookmark(Judgement.Citation);
  //check if Status
  if (Judgement.hasOwnProperty("status")) {
    status = true;
    if (Judgement.status.hasOwnProperty("finalStatus")) {
      citationClass = "font-bold";
    } else {
      Judgement.status.forEach((element) => {
        if (statusIdArray.includes(element.statusId)) {
          citationClass = "font-bold bg-red-500 text-white px-32";
          return;
        } else {
          citationClass = "font-bold";
        }
      });
    }
  } else {
    status = false;
    citationClass = "font-bold";
  }
  let paralinks = document.getElementsByClassName("paralinks");
  Array.from(paralinks).forEach(function (element) {
    element.addEventListener("click", () => {
      return scroll_To(element.innerHTML);
    });
  });
  let elements = document.getElementsByClassName("links");
  Array.from(elements).forEach(function (element) {
    element.addEventListener("click", () => {
      return test(event);
    });
  });

  let instance = new Mark(document.getElementById("highlight"));
  let words = localStorage.getItem("highlight");
  if (words != null) {
    let wordArray = words.split("|");
    wordArray.forEach((e) => {
      instance.mark(e, { accuracy: "partially", separateWordSearch: false });
    });
  }
  try {
    readingTime = calcRT(Judgement.judgement);
  } catch (error) {
    console.log(error);
  }
  jContainer = document.getElementById("highlight");
});

////
  const test = async (event) => {
    localStorage.setItem("casesCitedClick", "true");
    let q = event.target.innerHTML;
    let data = {
      from: 0,
      size: 15,
      query: {
        bool: {
          must: [
            {
              simple_query_string: {
                fields: ["Citation"],
                query: `"${q}"`,
              },
            },
          ],
        },
      },
    };
    let result = await axios({
      url: `${baseUrl}/judgement/nearlaw/_search`,
      auth: {
        username: USERNAME,
        password: PASSWORD,
      },
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: data,
    });
    Judgement = result.data.hits.hits[0]._source;
    tick();
  };

  const scroll_To = async (number) => {
    let navHeight = document.querySelector("nav > div > ul");
    let element = document.getElementById(number + "");
    let position = element.getBoundingClientRect();
    let bodyPosition = document.body.getBoundingClientRect();
    let y = position.top - bodyPosition.top - navHeight.offsetHeight;
    window.scrollTo(0, y);
  };

  const scrollUp = () => {
    window.scrollTo(0, 0);
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
  function getJudgement(indexVal) {
    let judgements = items;
    for (index = 0; index < judgements.length; index++) {
      if (index == indexVal) {
        if (index > judgements.length) {
          return false;
        }
        return judgements[index]["_source"];
      }
    }
  }
  const next = (index) => {
    // console.log("Index => ", index);
    // index++;
    // if (index > items.length - 1) {
    //   onNextPage();
    //   index = 0;
    //   Judgement = items[index]["_source"];
    // } else Judgement = items[index]["_source"];

    console.log("Index => ", index);
    index++;
    if (index > items.length - 1) {
      deafult("End of Results");
      return false;
    }
    Judgement = items[index]["_source"];
  };

  async function onNextPage() {
    console.log("on last record");
    localStorage.setItem("indexValue", 0);
    currentPage = parseInt(localStorage.getItem("currentPage"));
    currentPage += pageSize;
    localStorage.setItem("currentPage", currentPage);
    $query.from = currentPage;
    results = await queryES($query);
    items = results.data.hits.hits;
    console.log("item", items);
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
  const previous = (index) => {
    console.log("Index => ", index);
    index--;
    if (index < 0) {
      deafult("On First Result");
      return false;
    }
    Judgement = items[index]["_source"];
  };

  function mark(text) {
    event.path[0].classList.remove("bg-blue-500");
    event.path[0].classList.add("bg-green-500");
    if ($previousEvent.length != 0)
      $previousEvent.path[0].classList.add("bg-blue-500");
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
            message = `${counter} matches found!!!`;
            success(message);
          }
        },
        noMatch: function (range) {
          failure("No matches found");
        },
      });
    }
    $previousEvent = event;
  }

  function remove() {
    $findWords.pop();
    wordsdata = $findWords;
  }
</script>

<div id="fullJudgement" class="container mx-auto" class:dark-mode={$dark}>
  <div class="md:justify-center w-full">
    <div class="rounded overflow-hidden shadow-lg">
      <div class="border">
        <div
          class="flex font-serif border-b border-teal-400 border-dotted mb-1
          judgement-helper py-2"
        >
          <span
            class="flex mx-2 rounded overflow-hidden shadow-lg border-l border-b
            border-r cursor-pointer bg-white"
            on:click={() => {
              $dark = !$dark;
            }}
            class:dark={$dark}
          >
            <span class="flex my-auto">
              <Fa icon={faCircleHalfStroke} scale={0.5} size="2x" />
            </span>
            <span class="flex my-2 ml-1 mr-3">Night Mode</span>
          </span>

          <span
            class="flex mx-2 rounded overflow-hidden shadow-lg border-l border-b
            border-r cursor-pointer bg-white"
            on:click={() => {
              window.print();
            }}
            class:dark={$dark}
          >
            <span class="flex my-auto">
              <Fa icon={faPrint} scale={0.5} size="2x" />
            </span>
            <span class="flex my-2 ml-1 mr-3">Print</span>
          </span>
          <span
            class="flex mx-2 rounded overflow-hidden shadow-lg border-l border-b
            border-r cursor-pointer bg-white"
            on:click={zoomIn(judgementContainer)}
            class:dark={$dark}
          >
            <span class="flex my-auto">
              <Fa icon={faMagnifyingGlassPlus} scale={0.5} size="2x" />
            </span>
            <span class="flex my-2 ml-1 mr-3">Zoom In</span>
          </span>
          <span
            class="flex mx-2 rounded overflow-hidden shadow-lg border-l border-b
            border-r cursor-pointer bg-white"
            on:click={zoomOut(judgementContainer)}
            class:dark={$dark}
          >
            <span class="flex my-auto">
              <Fa icon={faMagnifyingGlassMinus} scale={0.5} size="2x" />
            </span>
            <span class="flex my-2 ml-1 mr-3">Zoom Out</span>
          </span>
          <Modal>
            <Content {isAnnotated} message={Judgement.Citation} {text} />
          </Modal>
          {#if isBookmarked}
            <!-- If its bookmarked -->
                    <span
            class="flex mx-2 bg-blue-500 rounded overflow-hidden shadow-lg
            border-l border-b border-r cursor-pointer text-white"
            on:click={() => deleteBookmark(Judgement.Citation)}
            class:dark-selected={$dark}
          >
            <span class="flex my-auto">
              <Fa icon={faBookmark} scale={0.5} size="2x" />
            </span>
            <span class="flex my-2 ml-1 mr-3">Remove Bookmark</span>
          </span>
          {:else}
            <!-- If not Bookmarked -->
             <span
            class="flex mx-2 rounded overflow-hidden shadow-lg border-l
            border-b border-r cursor-pointer bg-white"
            on:click={() => addBookMark(Judgement.Citation)}
            class:dark={$dark}
          >
            <span class="flex my-auto">
              <Fa icon={faBookmark} scale={0.5} size="2x" />
            </span>
            <span class="flex my-2 ml-1 mr-3">Add Bookmark</span>
          </span>
          {/if}
          <span
            class="flex mx-2 rounded overflow-hidden shadow-lg border-l border-b
            border-r cursor-pointer bg-white"
            class:dark={$dark}
          >
            <span class="flex my-auto">
              <Fa icon={faFilePdf} scale={0.5} size="2x" />
            </span>
            <span class="flex my-2 ml-1 mr-3">
              <a href="#/show-pdf">Show PDF</a>
            </span>
          </span>
          <span
            class="flex mx-2 rounded overflow-hidden shadow-lg border-l border-b
            border-r cursor-pointer bg-white"
            class:dark={$dark}
          >
            <span class="flex my-auto">
              <Fa icon={faClock} scale={0.5} size="2x" />
            </span>
            <span class="flex my-2 ml-1 mr-3">{readingTime} min</span>
          </span>
          {#if status}
            <!-- content here -->
            <Modal>
              <Statuscontent
                className="flex mx-2 rounded overflow-hidden shadow-lg border-l
                border-b border-r cursor-pointer bg-white"
                message={Judgement.Citation}
                statusArray={JSON.stringify(Judgement.status)}
              />
            </Modal>
          {/if}
          <Modal>
            <Find {jContainer} />
          </Modal>
        </div>
        <div class="hide-arrow">
          {#if wordsdata.length > 0}
            <div class="mb-auto">
              <span class="inline-flex align-middle">Keywords</span>
              <span class="inline-flex align-middle">
                <Fa icon={faArrowRight} scale={0.5} size="2x" />
              </span>
              {#each wordsdata as word}
                <span
                  class="inline-flex align-middle rounded mr-2 my-1 focus:outline-none cursor-pointer bg-blue-500 text-white px-2 py-1 font-bold"
                  on:click={() => mark(word)}>{word}</span
                >
              {/each}
              <span
                class="inline-flex align-middle text-red-600"
                on:click={() => remove()}
              >
                <Fa icon={faDeleteLeft} scale={0.5} size="4x" />
              </span>
            </div>
          {/if}
        </div>
        <div>
          <div class="mb-5 flex-row justify-evenly licence">
            <img
              src="./assets/allmr-logo/allmr-logo.png"
              alt="allmr-logo"
              height="100px"
              width="70px"
            />
            <h1 class="my-2 header text-xs w-1/2 text-center">
              LICENSED FOR OFFICIAL USE TO
              <b>{$advocateName}</b>
              <br />
              AUTHORIZED SOFTWARE &copy;
              <b>ALLMR ONLINE</b>
            </h1>
            <img
              src="./assets/allmr-logo/online.png"
              alt="online-logo"
              height="100px"
              width="70px"
            />
          </div>

          <div
            bind:this={judgementContainer}
            class="judgement-container"
            id="highlight"
          >
            <div class="text-center">
              {#if items.length > 1 && casesCitedClickValue != "true" && statusCheckerClickValue != "true" && statusCitationClickValue != "true"}
                <!-- content here -->
                <div class="flex justify-between">
                  <span
                    class="inline-flex align-middle mx-2 rounded overflow-hidden cursor-pointer hide-arrow mb-auto"
                    on:click={() => {
                      previous(getIndex(Judgement.Citation));
                    }}
                  >
                    <Fa icon={faArrowLeft} scale={0.5} size="3x" />
                  </span>
                  {#if Judgement.Citation}
                    <span
                      class="inline-flex align-middle mx-2 my-auto font-bold text-xl text-center hide-arrow"
                    >
                      {@html Judgement.Citation}
                    </span>
                  {/if}
                  <span
                    class="inline-flex align-middle mx-2 rounded overflow-hidden cursor-pointer hide-arrow mb-auto"
                    on:click={() => {
                      next(getIndex(Judgement.Citation));
                    }}
                  >
                    <Fa icon={faArrowRight} scale={0.5} size="3x" />
                  </span>
                </div>
              {:else if Judgement.Citation}
                <p class={citationClass}>
                  {@html Judgement.Citation}
                </p>
              {/if}
              {#if Judgement.Citation}
                <p class="font-bold text-xl my-2 text-center unhide hide">
                  {@html Judgement.Citation}
                </p>
              {/if}
              {#if Judgement.equivalent_citation}
                {#if Judgement.equivalent_citation.length !== 0}
                  <Modal>
                    <Equivalentcontent
                      message="Nothing"
                      className="p-2 m-3 rounded shadow-lg border-l border-b
                      border-r no-print bg-white"
                      CitationArray={JSON.stringify(
                        Judgement.equivalent_citation
                      )}
                    />
                  </Modal>
                {/if}
              {/if}
              <p class="mb-3">{Judgement.Court}</p>
              {#if Judgement.Judge_name}
                <p class="mb-3">
                  {@html Judgement.Judge_name}
                </p>
              {/if}
              <p class="font-bold mb-3">
                {@html Judgement.Petitioner}
              </p>
              VS
              <p class="font-bold mb-3">
                {@html Judgement.Respondent}
              </p>
              <p class="mb-3">{Judgement.Date}</p>
            </div>

            {#if Judgement.Case_No}
              <div>
                <span class="font-bold">Case No:</span>
                <p class="inline">
                  {@html Judgement.Case_No.replace(/\n\n/g, "<br>")}
                </p>
              </div>
            {/if}

            {#if Judgement.Adv_petitioner}
              <div>
                <span class="font-bold">Petitioner Counsel:</span>
                <p class="inline">
                  {@html Judgement.Adv_petitioner}
                </p>
              </div>
            {/if}

            {#if Judgement.Adv_respondent}
              <div>
                <span class="font-bold">Respondent Counsel:</span>
                <p class="inline">
                  {@html Judgement.Adv_respondent}
                </p>
              </div>
            {/if}

            {#if Judgement.act_statue_name}
              <div class="mb-3">
                <span class="font-bold">Act Name:</span>
                <p class="inline">
                  {@html Judgement.act_statue_name.replace(/\n\n/g, "<br>")}
                </p>
              </div>
            {/if}

            {#if Judgement.section}
              <div class="mb-3">
                <span class="font-bold">Section :</span>
                <p class="inline">
                  {@html Judgement.section.replace(/\n/g, "<br>")}
                </p>
              </div>
            {/if}
            {#if Judgement.HeadNote}
              <p class="mb-3">
                <span id="headnote" class="font-bold mt-3">HeadNote :</span>
                <HeadNote headnote={Judgement.HeadNote} />
              </p>
            {/if}
            <br />
            <br />
            {#if Judgement.cases_cited}
              <p class="mb-3">
                <span class="font-bold">Cases Cited :</span>
                <CasesCited cases={Judgement.cases_cited} />
              </p>
            {/if}
            {#if Judgement.judgement}
              <p class="font-bold text-center mt-3">JUDGEMENT</p>
              <JudgementC judgement={Judgement.judgement} />
            {/if}
            {#if Judgement.decision}
              <p class="text-right mt-2 decision">
                <spna>Decision :</spna>
                {@html Judgement.decision}
              </p>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<button
  on:click={scrollUp}
  class="fixed click-up shadow-xl rounded-full h-16 w-16 bg-white right-0
  bottom-0 mx-5 my-5 no-print"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24"
    viewBox="0 0 24 24"
    width="24"
  >
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z" />
  </svg>
</button>

<style>
  .hide {
    display: none;
  }
  .decision {
    font-family: "Lexend Deca";
  }
  .licence {
    display: none;
  }
  button {
    border: none;
    outline: none;
  }
  .click-up svg {
    position: relative;
    top: 0px;
    left: 50%;
    transform: translate(-50%, 0);
  }
  @media print {
    .licence {
      display: flex;
    }
    .judgement-helper {
      display: none;
    }
    .judgement-container {
      column-count: 2;
      margin-top: 2em !important;
      text-align: justify;
    }
    .hide-arrow {
      display: none;
    }
    .unhide {
      display: block;
    }
    .click-up svg {
      display: none;
    }
    .modal-wrap {
      display: none;
    }
    .no-print {
      display: none;
    }
    button {
      display: none;
    }
    footer {
      display: none;
    }
  }
</style>
