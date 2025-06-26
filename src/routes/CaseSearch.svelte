<script>
  import JudgementSearch from "../component/case-search/JudgementSearch.svelte";
  import JudgementInfo from "../component/case-search/JudgementInfo.svelte";
</script>

<div id="caseSearchBody">
  <div class="judgement-search">
    <JudgementSearch />
  </div>
  <div class="judgement-info float-left">
    <div class="list overflow-auto">
      <JudgementInfo />
    </div>
  </div>
</div>

<style>
  #caseSearchBody {
    margin: 1em 2em 0 2em;
  }
  .list {
    position: fixed;
    max-height: 100px;
  }
  @media only screen and (min-device-width: 1024px) and (max-device-width: 1280px) {
    #caseSearchBody {
      margin: 1em 0 0 0.5em;
    }
  }
</style>
