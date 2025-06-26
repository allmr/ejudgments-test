<script>
  import Accordion from "svelte-accordion";
  import { citation } from "../model/store.js";
  import SmartCitation from "../component/index-search/SmartCitation.svelte";
  import AdvocateIndex from "../component/index-search/AdvocateIndex.svelte";
  import CitationIndex from "../component/index-search/CitationIndex.svelte";
  import CaseNoIndex from "../component/index-search/CaseNoIndex.svelte";
  import JudgeIndex from "../component/index-search/JudgeIndex.svelte";
  import NominalIndex from "../component/index-search/NominalIndex.svelte";
  import CitationDetail from "../component/index-search/CitationDetail.svelte";
  import CitationList from "../component/index-search/CitationList.svelte";
  import CitationListData from "../component/index-search/CitationListData.svelte";
  import ActIndex from "../component/index-search/ActIndex.svelte";
  import SmartEquivalentCitation from "../component/index-search/SmartEquivalentCitation.svelte";
  import CasesCitedSearch from "../component/index-search/CasesCitedSearch.svelte";
  //store value with $ sign hence no need of subscribe & unsubscribe
  $: finalData = null;
  $: actName = "";
  $: judgeName = "";
  $: adv_name = "";
  $: freeTextSearch = "";
  $: citationList = false;
  $: citationData = null;
  function setFinalData(event) {
    citationList = false;
    let data = event.detail.finalData;
    let id = event.detail.id;
    finalData = {
      data: data,
      id: id,
    };
    console.log(finalData);
  }

  function handleCitationList(event) {
    citationList = true;
    console.log("List", event.detail.finalData.Citation);
    citationData = [event.detail.finalData];
  }

  function setListData(event) {
    console.log(event.detail);
    switch (event.detail.listData.id) {
      case "act":
        actName = JSON.parse(event.detail.listData.value);
        break;
      case "judge_name":
        judgeName = JSON.parse(event.detail.listData.value);
        break;
      case "adv_name":
        adv_name = JSON.parse(event.detail.listData.value);
      default:
        break;
    }
  }
  $: updatedCitation = $citation;
</script>

<div class="column-outs-container" id="indexSearchBody">
  <div class="citation-index">
    <div class="w-full max-w-xs">
      <div class="shadow-md rounded overflow-visible px-4 pt-3 pb-4 mb-2">
        <Accordion>
          <Accordion.Section title={"Smart Citation Search"}>
            <SmartCitation />
          </Accordion.Section>
          <Accordion.Section title={"Citation Search"}>
            <CitationIndex />
          </Accordion.Section>
          <Accordion.Section title={"Judge Name Search"}>
            <JudgeIndex
              judgeName={judgeName.view}
              judgeAbbr={JSON.stringify(judgeName.abbr)}
              on:finalData={setFinalData}
            />
          </Accordion.Section>
          <Accordion.Section title={"Advocate Name Search"}>
            <AdvocateIndex
              advocateName={adv_name.name}
              advocateAbbr={JSON.stringify(adv_name.abbr)}
              on:finalData={setFinalData}
            />
          </Accordion.Section>
          <Accordion.Section title={"Act Name Search"}>
            <ActIndex
              actName={actName.view}
              actAbbr={JSON.stringify(actName.abbr)}
              on:finalData={setFinalData}
            />
          </Accordion.Section>
          <Accordion.Section title={"Smart Equivalent Search"}>
            <SmartEquivalentCitation />
          </Accordion.Section>
          <Accordion.Section title={"Cases Cited Search"}>
            <CasesCitedSearch
              freeText={freeTextSearch.view}
              on:finalData={setFinalData}
            />
          </Accordion.Section>
        </Accordion>
      </div>
    </div>
  </div>
  <div class="relative">
    <div class="citation-list">
      <h1 class="text-xl text-center text-bold">Suggestions</h1>
      <hr />
      <CitationList on:listEvent={setListData} listDatas={finalData} />
    </div>
  </div>
</div>

<style>
  @media only screen and (min-device-width: 1024px) and (max-device-width: 1280px) {
    #indexSearchBody {
      margin: 1.5em 0 0 0;
    }
  }
  .column-outs-container {
    max-width: 1300px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
  }
  .citation-index {
    min-width: 300px;
  }
  .citation-list {
    margin-left: 20px;
    min-width: 300px;
    position: fixed;
    overflow: auto;
    max-height: 500px;
  }
</style>
