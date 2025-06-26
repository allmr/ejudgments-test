<script>
  import { onMount, tick, afterUpdate } from "svelte";
  import {
    respondentSearch,
    petitionerSearch,
    judgeNameSearch,
    autoFillSearch,
  } from "../../model/flexConfig";
  import { push, pop, replace } from "svelte-spa-router";
  import axios from "axios";
  import {
    petitionerInfo,
    PetitionerName,
    respondentInfo,
    RespondentName,
    judgeInfo,
    JudgeName,
    judgementResult,
    fullJudgementResult,
    totalRecords,
    highlight,
    baseUrl,
    JudgeNameList,
    query,
    actHighlight,
    actData,
    actHistory,
    casesCitedData,
    casesCitedHistory,
    casesCitedHighlight,
    partyNameData,
    partyNameHistory,
    partyNameHighlight,
    headNoteList,
    partyNameList,
    fullTextList,
    USERNAME,
    PASSWORD,
    boost,
  } from "../../model/store.js";
  import { history_db } from "../../model/store";
  import ActSearch from "./ActSearch.svelte";
  import HeadnoteSearch from "./HeadnoteSearch.svelte";
  import Fulljudgement from "./Fulljudgement.svelte";
  import CasesCitedSearch from "./CasesCitedSearch.svelte";
  import PartyNameSearch from "./PartyNameSearch.svelte";
  import { SvelteToast } from "@zerodevx/svelte-toast";
  import { success, failure } from "../../utils/Toast";

  let high = "";
  let totalcount = 0;
  let checkCountBtn = false;

  let today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth() + 1;
  $casesCitedData = [];
  let yyyy = today.getFullYear();
  if (dd < 10) {
    dd = "0" + dd; //like 01
  }
  if (mm < 10) {
    mm = "0" + mm; //like 03 for March
  }
  let humanRedableToday = `${yyyy}-${mm}-${dd}`;
  let minDate = "1950-01-01";
  let maxDate = humanRedableToday;
  let isloader = false;
  // start
  let date = localStorage.getItem("startDate");

  let newStartDate;
  let newEndDate;

  if (date === null) {
    date = "1950-01-01";
  }
  $: startDate = date;
  $: endDate = humanRedableToday;
  $: isloader = isloader;
  $: petitionerName = $PetitionerName;
  $: respondentName = $RespondentName;
  $: judgeName = $JudgeName;
  $: petitionerData = searchPetitioner(petitionerName);
  $: respondentData = searchRespondent(respondentName);
  $: judgeData = searchJudge(judgeName);

  // let $headNoteList = [];
  // let $fullTextList = [];
  let pcheck = true;
  let rcheck = true;
  let jcheck = true;
  let fjcheck = false;
  let hncheck = false;
  let pncheck = true;
  let hcCheck = false;
  let scCheck = false;
  let allCheck = true;

  let searchData = [];
  let hData = {}; // History Data
  hData.view = [];
  let temp = [];

  // let actData = [];
  // let actHistory = [];

  async function count() {
    isloader = true;
    let mustNotParams = [];

    if (hcCheck && !scCheck) {
      mustNotParams.push({
        simple_query_string: {
          query: "Supreme Court",
          fields: ["tribunal"],
        },
      });
    }

    if (scCheck && !hcCheck) {
      mustNotParams.push({
        simple_query_string: {
          query: "MumbaiHC",
          fields: ["tribunal"],
        },
      });
    }

    _getSearchValue(true);

    let data = {
      query: {
        bool: {
          must: searchData,
          should: boost,
          must_not: mustNotParams,
        },
      },
    };

    if (searchData.length === 0) {
      failure("No Search Criteria");
      return false;
    }

    if (startDate.length === 0 || endDate.length === 0) {
      searchData = [];
      isloader = false;
      failure("Date is Empty");
      checkCountBtn = false;
      return false;
    }

    let result = await axios({
      url: `${baseUrl}/judgement/nearlaw/_count`,
      auth: {
        username: USERNAME,
        password: PASSWORD,
      },
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: data,
    });

    totalcount = result.data.count;
    searchData.splice(0, searchData.length);
    checkCountBtn = true;
    isloader = false;
  }

  const getSelectedCourt = () => {
    if (allCheck) {
      return null;
    }
    if (hcCheck) {
      return {
        simple_query_string: {
          query: "MumbaiHC",
          fields: ["tribunal"],
        },
      };
    }
    if (scCheck) {
      return {
        simple_query_string: {
          query: "Supreme Court",
          fields: ["tribunal"],
        },
      };
    }
    if (scCheck && hcCheck) {
      return [
        {
          simple_query_string: {
            query: "Supreme Court",
            fields: ["tribunal"],
          },
        },
        {
          simple_query_string: {
            query: "MumbaiHC",
            fields: ["tribunal"],
          },
        },
      ];
    }
  };

  const search = async () => {
    let mustNotParams = [];

    if (hcCheck && !scCheck) {
      mustNotParams.push({
        simple_query_string: {
          query: "Supreme Court",
          fields: ["tribunal"],
        },
      });
    }

    if (scCheck && !hcCheck) {
      mustNotParams.push({
        simple_query_string: {
          query: "MumbaiHC",
          fields: ["tribunal"],
        },
      });
    }

    isloader = true;
    $highlight = [];
    _getSearchValue();

    if (searchData.length === 0) {
      failure("No Search Criteria");
      return false;
    }

    let data = {
      query: {
        bool: {
          must: searchData,
          should: boost,
          must_not: mustNotParams,
        },
      },
      sort: [
        {
          doj_sort: { order: "desc" },
        },
      ],
    };

    delete data.sort;

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

    data.from = 0;
    data.size = 100;

    data.sort = [
      {
        doj_sort: { order: "desc" },
      },
    ];
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
    $query = data;
    searchData = [];
    if (result.data.hits.total.value === 0) {
      failure("No Results Found");
      isloader = false;
      return false;
    }

    hData.time = Date.now();
    hData.query = data;
    history_db
      .post(hData)
      .then(function (result) {})
      .catch(function (err) {});

    $totalRecords = countNumber.data.count;
    $judgementResult = result.data.hits.hits;
    $fullJudgementResult = result.data.hits.hits;

    localStorage.setItem("sort", "latest");
    localStorage.setItem("filter", "all");
    localStorage.setItem("citationClick", "false");
    localStorage.setItem("casesCitedClick", "false");
    localStorage.setItem("statusCheckerClick", "false");
    localStorage.setItem("statusCitationClick", "false");
    localStorage.setItem("indexValue", 0);
    localStorage.setItem("totalRecords", $totalRecords);
    localStorage.setItem("currentPage", 0);
    push("/judgement");
  };

  const clearJudgement = () => {
    totalcount = 0;
    $PetitionerName = "";
    $RespondentName = "";
    petitionerName = "";
    respondentName = "";
    petitionerData = "";
    judgeData = "";
    respondentData = "";
    $petitionerInfo = [];
    $respondentInfo = [];
    $judgeInfo = [];
    judgeName = "";
    $headNoteList = [];
    $partyNameList = [];
    $fullTextList = [];
    $JudgeNameList = [];
    $actData = "";
    $actHighlight = "";
    $actHistory = "";
    $casesCitedData = "";
    $casesCitedHighlight = "";
    $casesCitedHistory = "";
    $partyNameData = "";
    $partyNameHighlight = "";
    $partyNameHistory = "";
    checkCountBtn = false;
    localStorage.removeItem("startDate");
    startDate = "1950-01-01";
    try {
      let actReset = document.getElementById("resetAct");
      actReset.click();
      let hnSelectId = document.getElementsByClassName("clearSelect");
      hnSelectId[0].click();
    } catch (e) {
      console.log(e);
    }
  };
  /*
    if count is true then the method is calledd by the count() so it will not store the history view
  */

  function _getSearchValue(count = false) {
    if (!hcCheck && !scCheck && !allCheck) {
      return false;
    }

    if (
      $PetitionerName !== null &&
      $PetitionerName !== undefined &&
      $PetitionerName !== ""
    ) {
      $highlight.push($PetitionerName);
      if (!count) hData.view.push(`Petitioner Name : ${$PetitionerName}`);
      let q = pcheck ? `"${$PetitionerName}"` : $PetitionerName;
      searchData.push({
        simple_query_string: {
          query: `${q}`,
          fields: ["Petitioner"],
        },
      });
    }
    if (
      $RespondentName !== null &&
      $RespondentName !== undefined &&
      $RespondentName !== ""
    ) {
      $highlight.push($RespondentName);
      if (!count) hData.view.push(`Respondent Name: ${$RespondentName}`);
      let q = rcheck ? `"${$RespondentName}"` : $RespondentName;
      searchData.push({
        simple_query_string: {
          query: `${q}`,
          fields: ["Respondent"],
        },
      });
    }
    if ($JudgeNameList.length > 0) {
      let query = [];

      $JudgeNameList.forEach((e) => {
        let q = "";
        if (e.abbr.length !== 0) {
          if (!count) hData.view.push(`Judge Name:${e.Judge_name}`);
          q = `("${e.Judge_name}")|("${e.abbr.join('")|("')}")`;
          $highlight = [...$highlight, e.Judge_name, e.abbr];
        } else {
          if (!count) hData.view.push(`Judge Name:${e.Judge_name}`);
          $highlight = [...$highlight, e.Judge_name];
          q = `("${e.Judge_name}")`;
        }
        query.push(q);
      });
      searchData.push({
        simple_query_string: {
          query: `${query.join("|")}`,
          fields: ["Judge_name"],
          default_operator: "and",
        },
      });
    }
    if ($actData.length > 0) {
      searchData = [...searchData, ...$actData];
      if (!count) hData.view = [...hData.view, ...$actHistory];
    }
    if ($casesCitedData.length > 0) {
      searchData = [...searchData, ...$casesCitedData];
      if (!count) hData.view = [...hData.view, ...$casesCitedHistory];
    }

    // if ($partyNameData.length > 0) {
    //   searchData = [...searchData, ...$partyNameData];
    //   if (!count) hData.view = [...hData.view, ...$partyNameHistory];
    // }

    if ($headNoteList.length > 0) {
      if (hncheck) $highlight = [...$highlight, $headNoteList];
      else {
        $headNoteList.forEach((element) => {
          temp = element.split(" ");
          temp.forEach((element) => {
            $highlight.push(temp);
          });
        });
      }

      let q = $headNoteList;
      if (!count) hData.view.push(`Headnote : ${$headNoteList.join(",")}`);
      searchData.push({
        simple_query_string: {
          query: `${q.join(" ")}`,
          fields: ["HeadNote"],
          default_operator: "AND",
        },
      });
    }
    if ($partyNameList.length > 0) {
      $highlight = [...$highlight, $partyNameList];
      let q = $partyNameList;
      if (!count) hData.view.push(`Party Name: ${$partyNameList.join(",")}`);
      searchData.push({
        simple_query_string: {
          query: `${q.join(" ")}`,
          fields: ["cases_cited", "cases_citated"],
          default_operator: "and",
        },
      });
    }
    if ($fullTextList.length > 0) {
      $highlight = [...$highlight, $fullTextList];
      if (fjcheck) $highlight = [...$highlight, $fullTextList];
      else {
        $fullTextList.forEach((element) => {
          temp = element.split(" ");
          temp.forEach((element) => {
            $highlight.push(temp);
          });
        });
      }
      let q = $fullTextList;
      if (!count)
        hData.view.push(`Full judgement : ${$fullTextList.join(",")}`);
      searchData.push({
        simple_query_string: {
          query: `${q.join(" ")}`,
          fields: [
            "Citation",
            "Court",
            "Judge_name",
            "Petitioner",
            "Respondent",
            "doj",
            "Adv_petitioner",
            "Adv_respondent",
            "HeadNote^2",
            "cases_cited",
            "cases_citated",
            "judgement^3",
          ],
          default_operator: "and",
        },
      });
    }

    if (searchData.length === 0) {
      isloader = false;
      return false;
    }

    let courtObj = getSelectedCourt();

    if (courtObj !== null) {
      searchData.push(courtObj);
    }

    if (
      $actHighlight !== null ||
      $actHighlight !== "" ||
      $actHighlight !== undefined ||
      $casesCitedHighlight !== null ||
      $casesCitedHighlight !== "" ||
      $casesCitedHighlight !== undefined ||
      $partyNameHighlight !== null ||
      $partyNameHighlight !== "" ||
      $partyNameHighlight !== undefined
    ) {
      high =
        "|" +
        $highlight.flat(Infinity).join("|") +
        "|" +
        $actHighlight +
        "|" +
        $casesCitedHighlight +
        "|";
      $partyNameHighlight + "|";
    } else {
      high = "|" + $highlight.flat(Infinity).join("|") + "|";
    }
    high = high.replace(/\"+/gm, ""); //to replace "" from the highlight
    localStorage.setItem("highlight", high);

    newStartDate = document.getElementById("startdate").value;
    newEndDate = document.getElementById("enddate").value;

    if (newStartDate != date || newEndDate != humanRedableToday) {
      searchData.push({
        range: {
          doj_sort: {
            gte: startDate + " 00:00:00",
            lte: endDate + " 00:00:00",
          },
        },
      });
    } else if (newStartDate === date || newEndDate === humanRedableToday) {
      delete searchData.range;
    }
    localStorage.setItem("startDate", newStartDate);
  }

  const searchPetitioner = (petName) => {
    let result = [];
    if (petName.length > 3) {
      result = petitionerSearch.search({
        sort: "view",
        query: petitionerName,
        field: "view",
      });
    } else if (petName.length == 0) {
      $PetitionerName = "";
    }
    $petitionerInfo = result;
    return result;
  };

  const searchRespondent = (resName) => {
    let result = [];
    if (resName.length > 3) {
      result = respondentSearch.search({
        sort: "view",
        query: resName,
        field: "view",
      });
    } else if (resName.length == 0) {
      $RespondentName = "";
    }
    $respondentInfo = result;
    return result;
  };

  // const autoFill = async input => {
  //   let result = await autoFillSearch.search({
  //     size: 100,
  //     query: input,
  //     field: "view"
  //   });
  //   return result;
  // };

  const searchJudge = async (judgeName) => {
    let result = [];
    if (judgeName !== "") {
      result = await judgeNameSearch.search({
        sort: "Judge_name",
        query: judgeName,
        field: "Judge_name",
      });
    }
    $judgeInfo = result;
    return $judgeInfo;
  };

  /*
   * Headnote methods
   */
  const addHeadNote = (event) => {
    let headNote = event.detail.value;
    if (headNote === "") {
      failure("No Input");
      return false;
    }
    if (hncheck) {
      headNote = `\"${headNote}\"`;
    }
    $headNoteList = [...$headNoteList, headNote];
  };

  //remove headnote
  const removeHeadNote = (id) => {
    $headNoteList = $headNoteList.filter((element, index) => {
      if (index !== id) {
        return element;
      }
    });
  };

  /*
   * PartyName methods
   */
  const addPartyName = (event) => {
    let partyName = event.detail.value;
    if (partyName === "") {
      failure("No Input");
      return false;
    }
    if (pncheck) {
      partyName = `\"${partyName}\"`;
    }
    $partyNameList = [...$partyNameList, partyName];
  };

  //remove PartyName
  const removePartyName = (id) => {
    $partyNameList = $partyNameList.filter((element, index) => {
      if (index !== id) {
        return element;
      }
    });
  };
  /*
   * Full Text methods
   */
  const addFullText = (event) => {
    let fullText = event.detail.value;
    if (fullText === "") {
      failure("No Input");
      return false;
    }
    if (fjcheck) {
      fullText = `\"${fullText}\"`;
    }
    $fullTextList = [...$fullTextList, fullText];
  };
  // remove full Text
  const removeFullText = (id) => {
    $fullTextList = $fullTextList.filter((element, index) => {
      if (index !== id) {
        return element;
      }
    });
  };

  const removeJudgeName = (id) => {
    $JudgeNameList = $JudgeNameList.filter((element, index) => {
      if (index !== id) {
        return element;
      }
    });
  };

  /*
   * Handle Acts
   */
  const handleActdata = (event) => {
    $actData = event.detail.actData;
    $actHistory = event.detail.history;
    $actHighlight = event.detail.highlight;
  };

  /*
   * Cases Cited methods
   */
  const handleCasesCiteddata = (event) => {
    $casesCitedData = event.detail.casesCitedData;
    $casesCitedHistory = event.detail.history;
    $casesCitedHighlight = event.detail.highlight;
  };

  /*
   * Party Name methods
   */
  // const handlePartyNamedata = event => {
  //   $partyNameData = event.detail.partyNameData;
  //   $partyNameHistory = event.detail.history;
  //   $partyNameHighlight = event.detail.highlight;
  // };
</script>

{#if isloader}
  <div class="loader" />
{/if}

<div>
  <div id="left">
    <!-- Select Date -->
    <div class="flex flex-wrap mb-2 w-full justify-between">
      <div class="w-2/5 m-0">
        <label class="block uppercase tracking-wide text-xl font-bold mb-2">
          Start Date
        </label>
        <input
          class="appearance-none block text-gray-700 border rounded py-2 px-5
          leading-tight focus:bg-white focus:border-black w-full"
          type="date"
          min={minDate}
          max={maxDate}
          bind:value={startDate}
          id="startdate"
        />
      </div>
      <div class="w-2/5 m-0">
        <label class="block uppercase tracking-wide text-xl font-bold mb-2">
          End Date
        </label>
        <input
          class="appearance-none block text-gray-700 border rounded py-2 px-5
          leading-tight focus:bg-white focus:border-black w-full"
          id="enddate"
          type="date"
          min={minDate}
          max={maxDate}
          bind:value={endDate}
        />
      </div>
    </div>
    <!-- End of Select Date -->

    <!-- Search for Full Text -->
    <div class="mb-2">
      <div class="flex flex-row w-full mb-2 md:mb-0 justify-between">
        <label
          class="block uppercase tracking-wide text-xl font-bold mb-2"
          for="grid-fulltext"
        >
          Full Text
        </label>
        <div>
          <input class="leading-tight" type="checkbox" bind:checked={fjcheck} />
          <span class="text-sm">Exact</span>
        </div>
      </div>
      <div class="flex flex-col justify-between">
        <div class="relative flex flex-row mb-1">
          <Fulljudgement on:fullJudgementData={addFullText} />
        </div>
      </div>
      <div class="px-3">
        {#each $fullTextList as item, i}
          <div
            class="bg-blue-500 text-white font-bold py-2 px-4 mb-2 mr-2 rounded
            items-center"
          >
            <span class="mr-1">{item}</span>
            <div class="float-right align-middle">
              <svg
                id={i}
                on:click={(e) => removeFullText(i)}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="black"
                width="18px"
                height="18px"
              >
                <path
                  d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59
                  6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                />
                <path d="M0 0h24v24H0z" fill="none" />
              </svg>
            </div>
          </div>
        {/each}
      </div>
    </div>
    <!-- End of Search for Full Text -->

    <!-- Search for Headnote -->
    <div class="mb-2">
      <div class="flex flex-row w-full mb-2 md:mb-0 justify-between">
        <label
          class="block uppercase tracking-wide text-xl font-bold mb-2"
          for="grid-headnote"
        >
          Head Notes
        </label>
        <div>
          <input class="leading-tight" type="checkbox" bind:checked={hncheck} />
          <span class="text-sm">Exact</span>
        </div>
      </div>
      <div id="headnote" class="flex flex-col justify-between">
        <div class="relative flex flex-row mb-1">
          <HeadnoteSearch on:headnoteData={addHeadNote} />
        </div>
      </div>
      <div class="px-3">
        {#each $headNoteList as item, i}
          <div
            class="bg-blue-500 text-white font-bold py-2 px-4 mb-2 mr-2 rounded
            items-center"
          >
            <span class="mr-1">{item}</span>
            <div class="float-right align-middle">
              <svg
                id={i}
                on:click={(e) => removeHeadNote(i)}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="black"
                width="18px"
                height="18px"
              >
                <path
                  d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59
                  6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                />
                <path d="M0 0h24v24H0z" fill="none" />
              </svg>
            </div>
          </div>
        {/each}
      </div>
    </div>
    <!-- End of Search for Headnote -->

    <div class="flex flex-row mb-2">
      <div class="flex flex-col w-1/2 pr-3">
        <div class="flex flex-row justify-between">
          <label class="block uppercase tracking-wide text-xl font-bold mb-2">
            Petitioner
          </label>
          <div class="mb-1">
            <input
              class="leading-tight"
              type="checkbox"
              bind:checked={pcheck}
            />
            <span class="text-sm">Exact</span>
          </div>
        </div>
        <input
          class="appearance-none block w-full text-gray-700 border rounded py-2
          px-3 mb-3 leading-tight focus:bg-white focus:border-black"
          id="grid-petitioner-name"
          placeholder="Enter Petitioner Name"
          bind:value={petitionerName}
        />
      </div>
      <div class="flex flex-col w-1/2">
        <div class="flex flex-row justify-between">
          <label class="block uppercase tracking-wide text-xl font-bold mb-2">
            Respondent
          </label>
          <div class="mb-1">
            <input
              class="leading-tight"
              type="checkbox"
              bind:checked={rcheck}
            />
            <span class="text-sm">Exact</span>
          </div>
        </div>
        <div class="w-full mb-2 md:mb-0">
          <input
            class="appearance-none block w-full border rounded py-2 px-4 mb-3
            leading-tight focus:bg-white focus:border-black"
            type="text"
            placeholder="Enter Respondent Name"
            bind:value={respondentName}
          />
        </div>
      </div>
    </div>

    <div class="flex flex-wrap mb-2">
      <div class="flex flex-col w-1/2 pr-3">
        <div class="flex flex-row justify-between">
          <label class="block uppercase tracking-wide text-xl font-bold mb-2">
            Judge Name
          </label>
          <div>
            <input
              class="leading-tight"
              type="checkbox"
              bind:checked={jcheck}
            />
            <span class="text-sm">Exact</span>
          </div>
        </div>
        <input
          class="appearance-none block w-full text-gray-700 border rounded py-2
          px-4 mb-3 leading-tight focus:bg-white focus:border-black"
          bind:value={judgeName}
          placeholder="Enter Judge Name"
        />
      </div>
      <div class="w-2/5flex flex-col w-1/2">
        <label class="block uppercase tracking-wide text-xl font-bold mb-2 ">
          Court
        </label>

        <input
          id="allCheck"
          class="leading-tight"
          type="checkbox"
          bind:checked={allCheck}
        />
        <label for="allCheck">All Courts</label>
        <br />
        <input
          id="sc"
          class="leading-tight"
          type="checkbox"
          bind:checked={scCheck}
        />
        <label for="sc">Supreme Court</label>
        <br />
        <input
          id="hc"
          class="leading-tight"
          type="checkbox"
          bind:checked={hcCheck}
        />
        <label for="hc">Bombay High Court</label>
        <br />
      </div>
    </div>
    <div class="flex flex-row flex-wrap px-3">
      {#each $JudgeNameList as item, i}
        <div
          class="bg-blue-500 text-white font-bold py-2 px-4 mb-2 mr-2 rounded
          inline-flex items-center"
        >
          <span class="mr-1">{item.Judge_name}</span>
          <div>
            <svg
              id={i}
              on:click={(e) => removeJudgeName(i)}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="black"
              width="18px"
              height="18px"
            >
              <path
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41
                19 12 13.41 17.59 19 19 17.59 13.41 12z"
              />
              <path d="M0 0h24v24H0z" fill="none" />
            </svg>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Start of Second Column -->
  <div class="mx-5" id="right">
    <div class="mb-2">
      <ActSearch on:actdata={handleActdata} />
    </div>
    <!-- Search for CasesCited -->
    <div class="mb-2">
      <CasesCitedSearch on:casesCitedData={handleCasesCiteddata} />
      <!-- <PartyNameSearch on:partyNameData={handlePartyNamedata} /> -->
    </div>
    <!-- End of Search for Cases Cited -->

    <!-- Search for PartyName -->
    <div class="mb-2">
      <div class="flex flex-row w-full md:mb-0 justify-between">
        <label
          class="block uppercase tracking-wide text-xl font-bold mb-2"
          for="grid-headnote"
        >
          Party Name
        </label>
        <div>
          <input class="leading-tight" type="checkbox" bind:checked={pncheck} />
          <span class="text-sm">Exact</span>
        </div>
      </div>
      <div id="headnote" class="flex flex-col justify-between">
        <div class="relative flex flex-row mb-1">
          <PartyNameSearch on:partyNameData={addPartyName} />
        </div>
      </div>
      <div class="px-3">
        {#each $partyNameList as item, i}
          <div
            class="bg-blue-500 text-white font-bold py-2 px-4 mb-2 mr-2 rounded
            items-center"
          >
            <span class="mr-1">{item}</span>
            <div class="float-right align-middle">
              <svg
                id={i}
                on:click={(e) => removePartyName(i)}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="black"
                width="18px"
                height="18px"
              >
                <path
                  d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59
                  6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                />
                <path d="M0 0h24v24H0z" fill="none" />
              </svg>
            </div>
          </div>
        {/each}
      </div>
    </div>
    <!-- End of Search for PartyName -->
    <div class="w-full">
      {#if totalcount !== 0 && checkCountBtn == true}
        <label class="block text-white text-l font-bold p-2 mb-2 bg-green-500">
          Total Count : {totalcount}
        </label>
      {:else if totalcount == 0 && checkCountBtn == true}
        <label class="block text-white text-l font-bold p-2 mb-2 bg-red-600">
          Total Count : {totalcount}
        </label>
      {:else}
        <label
          class="block border border-gray-500 text-gray-600 text-l font-bold p-2
          mb-2 bg-gray-100"
        >
          Total Count : {totalcount}
        </label>
      {/if}
    </div>
    <!-- Buttons -->
    <div class="flex items-center justify-between w-full">
      <button
        class="text-blue-700 bg-white border border-blue-700 hover:bg-blue-700
        hover:text-white bg-white font-bold py-2 w-4/12 rounded
        focus:outline-none focus:shadow-outline mr-2"
        type="button"
        on:click={count}
      >
        Count Results
      </button>

      <button
        class="primary-btn font-bold py-2 w-4/12 rounded focus:outline-none
        focus:shadow-outline mr-2"
        type="button"
        on:click={search}
      >
        Search
      </button>

      <!-- <button
      class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 w-4/12
      rounded focus:outline-none focus:shadow-outline"
      type="button"
      on:click={clearJudgement}
    > -->
      <button
        class="text-red-700 bg-white border border-red-700 hover:bg-red-700
        hover:text-white font-bold py-2 w-4/12 rounded focus:outline-none
        focus:shadow-outline"
        type="button"
        on:click={clearJudgement}
      >
        Clear All
      </button>
    </div>
  </div>
</div>

<style>
  * {
    outline: none;
  }
  input {
    border: 1px solid #9e9e9e;
  }
  .text-xl {
    font-size: 0.8rem;
  }
  .pills {
    left: 100%;
    bottom: 50%;
  }

  #left {
    float: left;
    width: 35%;
    height: 100%;
  }
  #right {
    float: left;
    width: 35%;
    height: 100%;
  }
</style>
