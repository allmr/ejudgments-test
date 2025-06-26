<script>
  import { getContext } from "svelte";
  import axios from "axios";
  import { push } from "svelte-spa-router";
  import {
    judgementResult,
    baseUrl,
    totalRecords,
    fullJudgementData,
    USERNAME,
    PASSWORD,
  } from "../model/store.js";
  export let CitationArray;
  export let onCancel = () => {};
  export let onOkay = () => {};

  $: items = $judgementResult;

  const { close } = getContext("simple-modal");

  let value = JSON.parse(CitationArray);
  let onChange = () => {};

  function _onCancel() {
    onCancel();
    close();
  }

  function _onOkay() {
    onOkay(value);
    close();
  }

  const checkALLMRJournal = (journalName) => {
    let journal;
    console.log(journalName);
    if (
      /([0-9]{4})(\([0-9]{1}\))? ((ALL SCR \(ONLINE\))|(ALL SCR)|(ALL SCR \(Cri\))|(ALL MR)|(ALLMR ONLINE)|(ALL MR \(SUPREME COURT\))|(ALL MR \(Cri\))|(ALL MR \(Cri\) \(SUPREME COURT\))|(ALL MR \(JOURNAL\))|(ALL MR \(Cri\) \(JOURNAL\))) ([0-9]+)(\s\(S\.C\.\))?/gm.test(
        journalName
      )
    ) {
      journal = "ALLMR";
    } else if (
      /([0-9]{4})(\([0-9]{1}\))? (Nearlaw \(Mumbai HC\))|(Nearlaw \(Mumbai HC\) \(Cri\))|(Nearlaw \(Mumbai HC\) \(SUPREME COURT\))|(Nearlaw \(Mumbai HC\) \(Cri\) \(SUPREME COURT\))|(Nearlaw \(BombayHC\) Online)|(Nearlaw \(BombayHC Goa\) Online)|(Nearlaw \(BombayHC Nagpur\) Online)|(Nearlaw \(BombayHC Aurangabad\) Online) ([0-9]+)(\s\(S\.C\.\))?/gm.test(
        journalName
      )
    ) {
      journal = "Nearlaw";
    } else {
      journal = "other";
    }
    return journal;
  };

  var search = async (event) => {
    let q = event.target.innerHTML;
    let data = {
      from: 0,
      size: 1,
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
    $judgementResult = result.data.hits.hits;
    $totalRecords = result.data.hits.total.value;
    localStorage.setItem("equivalentCitationClick", "true");
    console.log("equi", $judgementResult, $totalRecords);
    if ($totalRecords != 0) {
      $fullJudgementData = $judgementResult[0]["_source"];
      push("/fulljudgement");
    } else $judgementResult = items;
  };
  $: onChange(value);
</script>

<!-- class="w-1/2 flex-1 bg-white text-red-500 border border-red-500 
rounded py-3 focus:outline-none focus:bg-red-700 focus:border-red-500 
focus:text-white hover:text-white hover:bg-red-500" -->

<h3 class="font-sans text-center mb-3">Equivalent Citations</h3>
<ul>
  {#each value as equivalentCitation}
    {#if checkALLMRJournal(equivalentCitation) === "ALLMR"}
      <li>
        <span
          class="text-blue-500 font-medium italic"
          style="cursor:pointer"
          on:click={search}
        >
          {equivalentCitation}
        </span>
      </li>
    {:else if checkALLMRJournal(equivalentCitation) === "NearLaw"}
      <li>
        <span class="font-medium italic">
          {equivalentCitation} (Same Judgement)
        </span>
      </li>
    {:else}
      <li>
        <span class="font-medium italic">{equivalentCitation}</span>
      </li>
    {/if}
  {/each}
</ul>

<style>
  h2 {
    font-size: 2rem;
    text-align: center;
  }

  input {
    width: 100%;
  }

  .buttons {
    display: flex;
    justify-content: space-between;
  }
</style>
