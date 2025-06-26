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
  export let message;
  export let statusArray;
  export let onCancel = () => {};
  const { close } = getContext("simple-modal");
  let value = JSON.parse(statusArray);
  $: items = $judgementResult;
  function _onCancel() {
    onCancel();
    close();
  }

  function _onOkay() {
    onOkay(value);
    close();
  }
  var search = async (event) => {
    if (
      /([0-9]{4})(\([0-9]{1}\))? ((ALL SCR \(ONLINE\))|(ALL SCR)|(ALL SCR \(Cri\))|(ALL MR)|(ALLMR ONLINE)|(ALL MR \(SUPREME COURT\))|(ALL MR \(Cri\))|(ALL MR \(Cri\) \(SUPREME COURT\))|(ALL MR \(JOURNAL\))|(ALL MR \(Cri\) JOURNAL)|(ALL MR \(Cri\) \(JOURNAL\))|(Nearlaw \(Mumbai HC\))|(Nearlaw \(Mumbai HC\) \(Cri\))|(Nearlaw \(Mumbai HC\) \(SUPREME COURT\))|(Nearlaw \(Mumbai HC\) \(Cri\) \(SUPREME COURT\))|(Nearlaw \(BombayHC\) Online)|(Nearlaw \(BombayHC Goa\) Online)|(Nearlaw \(BombayHC Nagpur\) Online)|(Nearlaw \(BombayHC Aurangabad\) Online)|(Nearlaw \(DelhiHC\))|(Nearlaw \(KER\) Online)|(Nearlaw \(KAR\) Online)|(Nearlaw \(GUJ\) Online)|(Nearlaw \(CAL\) Online)|(Nearlaw \(PUN\) Online)|(Nearlaw \(ALH\) Online)) ([0-9]+)(\s\(S\.C\.\))?/gm.test(
        event.target.innerHTML
      )
    ) {
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
      console.log($judgementResult);
      if ($totalRecords != 0) {
        $fullJudgementData = $judgementResult[0]._source;
        localStorage.setItem("statusCitationClick", "true");
        $judgementResult = items;
        push("/fulljudgement");
      } else {
        $judgementResult = items;
        close();
        failure("No results Found");
        push("/fulljudgement");
      }
    } else {
      failure("Judgement Not Found");
    }
  };
</script>

<ul>
  {#if value.finalStatus}
    {#each value.finalStatus as fs}
      <li>
        <span class="text-black" style="cursor:pointer">{fs}</span>
      </li>
    {/each}
  {:else}
    {#each value as status}
      <!-- content here -->
      <li>
        <b>{message}</b>
        {status.statusText}
        <span class="text-blue-500" style="cursor:pointer" on:click={search}>
          {status.judgmentCitation}
        </span>
      </li>
    {/each}
  {/if}
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
