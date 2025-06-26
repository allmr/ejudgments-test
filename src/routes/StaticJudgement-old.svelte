<script>
  import { onMount, tick, afterUpdate } from "svelte";
  import axios from "axios";
  import {
    advocateName,
    fullJudgementData,
    citationMapJudgementResult,
    baseUrl,
    judgementResult,
    USERNAME,
    PASSWORD,
  } from "../model/store.js";
  import { citationElasticSearch } from "../utils/CitationSearchModule.svelte";
  import { push } from "svelte-spa-router";
  import HeadNote from "./HeadNote.svelte";
  import CasesCited from "./CasesCited.svelte";
  import JudgementC from "./Judgement.svelte";
  import Mark from "mark.js";
  import Modal from "./Modal.svelte";
  import Find from "./Find.svelte";
  import { deafult } from "../utils/Toast";
  import Tooltip from "../utils/Tooltip.svelte";
  import Statuscontent from "./statusContent.svelte";
  import Equivalentcontent from "./EquivalentContent.svelte";
  import Fa from "svelte-fa";
  import { faFilePdf } from "@fortawesome/free-regular-svg-icons";
  import { faPrint } from "@fortawesome/free-solid-svg-icons";

  export let judgement;
  export let items;

  let jContainer;
  let index = 0;
  let judgementContainer;
  let status = false;
  let casesCitedClickValue = "";

  const allMrLogo = "img/ONLINE-LOGO-CL.jpg";

  const statusIdArray = [
    1, 7, 12, 13, 14, 16, 19, 20, 23, 32, 33, 34, 36, 37, 38, 39, 41, 42, 43,
    44, 45, 46, 47, 48, 49,
  ];
  let citationClass = "font-bold text-xl mb-2";

  onMount(() => {
    if (!Object.keys(Judgement).length) {
      //Object is empty
      push("/case-search");
    }
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
    jContainer = document.getElementById("highlight").innerHTML;
  });

  afterUpdate(() => {
    scrollUp(); // to scroll up
    $citationMapJudgementResult = Judgement;
    $fullJudgementData = $citationMapJudgementResult;
    $judgementResult = items;

    casesCitedClickValue = localStorage.getItem("casesCitedClick");

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
    jContainer = document.getElementById("highlight");
  });

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

  $: Judgement = JSON.parse(judgement);

  const scrollUp = () => {
    window.scrollTo(0, 0);
  };

  function getIndex(citation) {
    let judgements = items;
    for (index = 0; index < judgements.length; index++) {
      if (judgements[index]["Citation"] == citation) {
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
        return judgements[index]["Citation"];
      }
    }
  }
  const next = async (index) => {
    console.log("Index => ", index);
    index++;
    if (index > items.length - 1) {
      deafult("End of Results");
      return false;
    }
    let q = getJudgement(index);
    judgement = await citationElasticSearch(q);
    judgement = JSON.stringify(judgement.data.hits.hits[0]._source);
    $citationMapJudgementResult = Judgement;
  };

  const previous = async (index) => {
    console.log("Index => ", index);
    index--;
    if (index < 0) {
      deafult("On First Result");
      return false;
    }
    let q = getJudgement(index);
    judgement = await citationElasticSearch(q);
    judgement = JSON.stringify(judgement.data.hits.hits[0]._source);
    $citationMapJudgementResult = Judgement;
  };
</script>

<div id="fullJudgement" class="container mx-auto">
  <div class="md:justify-center w-full">
    <div class="rounded overflow-hidden shadow-lg">
      <div class="border">
        <div
          class="flex font-serif border-b border-teal-400 border-dotted mb-3
          judgement-helper py-2"
        >
          <span
            class="flex mx-2 rounded overflow-hidden shadow-lg border-l border-b
            border-r cursor-pointer bg-white"
            on:click={() => {
              window.print();
            }}
          >
            <span class="flex my-auto">
              <Fa icon={faPrint} scale={0.5} size="2x" />
            </span>
            <span class="flex my-2 ml-1 mr-3">Print</span>
          </span>
          <span
            class="flex mx-2 rounded overflow-hidden shadow-lg border-l border-b
            border-r cursor-pointer bg-white"
          >
            <span class="flex my-auto">
              <Fa icon={faFilePdf} scale={0.5} size="2x" />
            </span>
            <span class="flex my-2 ml-1 mr-3">
              <a href="#/show-pdf">Show PDF</a>
            </span>
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
          <br />
          <div
            bind:this={judgementContainer}
            class="judgement-container"
            id="highlight"
          >
            <div class="text-center">
              {#if items.length > 1 && casesCitedClickValue != "true"}
                <!-- content here -->
                <div class="flex flex-row justify-between mb-2 mx-8">
                  <Tooltip>
                    <svg
                      slot="activator"
                      class="h-6 w-8 fill-current cursor-pointer text-black-500
                      hide-arrow"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      on:click={() => previous(getIndex(Judgement.Citation))}
                    >
                      <polygon
                        points="3.828 9 9.899 2.929 8.485 1.515 0 10 .707 10.707
                        8.485 18.485 9.899 17.071 3.828 11 20 11 20 9 3.828 9"
                      />
                    </svg>
                    Previous
                  </Tooltip>
                  {#if Judgement.Citation}
                    <p class={citationClass}>
                      {@html Judgement.Citation}
                    </p>
                  {/if}
                  <Tooltip>
                    <svg
                      slot="activator"
                      class="h-6 w-8 align-middle fill-current text-black-500
                      hide-arrow cursor-pointer"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      on:click={() => next(getIndex(Judgement.Citation))}
                    >
                      <polygon
                        points="16.172 9 10.101 2.929 11.515 1.515 20 10 19.293
                        10.707 11.515 18.485 10.101 17.071 16.172 11 0 11 0 9"
                      />
                    </svg>
                    Next
                  </Tooltip>
                </div>
              {:else if Judgement.Citation}
                <p class={citationClass}>
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
    .hide-arrow {
      display: none;
    }
    .licence {
      display: flex;
    }
    .judgement-helper {
      display: none;
    }
    .judgement-container {
      column-count: 2;
      text-align: justify;
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
  }
</style>
