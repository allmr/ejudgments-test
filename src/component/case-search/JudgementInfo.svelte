<script>
  import PetitionerList from "./PetitionerList.svelte";
  import RespondentList from "./RespondentList.svelte";
  import JudgeNameList from "./JudgeNameList.svelte";
</script>

<div class="list fixed overflow-auto" id="jInfo">
  <PetitionerList />
  <RespondentList />
  <JudgeNameList />
</div>

<style>
  .list {
    max-height: 400px;
  }

  #jInfo {
    scrollbar-width: thin;
    -ms-overflow-style: none;
  }

  #jInfo::-webkit-scrollbar-track {
    -webkit-box-shadow: none !important;
    background-color: transparent !important;
  }

  #jInfo::-webkit-scrollbar {
    width: 12px !important;
    background-color: transparent;
  }

  #jInfo::-webkit-scrollbar-thumb {
    background-color: #acacac;
  }
</style>
