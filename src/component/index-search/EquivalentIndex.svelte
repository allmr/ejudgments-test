<script>
  import { judgementResult, totalRecords } from "../../model/store";
  import { push } from "svelte-spa-router";
  import { citationElasticSearch } from "../../utils/CitationSearchModule.svelte";
  import { save } from "../../utils/historyModule.svelte";

  // your script goes here
  $: inputYear = "";
  $: inputVolume = "";
  $: inputPublication = publications[0];
  $: inputPage = "";
  $: inputCourt = "";
  $: isCourt = inputPublication === publications[0] ? true : false;

  const publications = [
    "AIR",
    "Bom.L.R.",
    "Mh.L.J.",
    "Mh.L.J. (Cri)",
    "Bom.C.R.",
    "Bom.C.R. (Cri)",
    "Mah.L.R.",
    "SCC",
    "SCC (Cri)",
    "ALL MR",
    "ALL MR (Cri)",
    "ALL MR (JOURNAL)",
    "ALL MR (Cri) JOURNAL",
    "ALL MR (N.O.C)",
    "ALL MR (Cri) N.O.C",
    "ALL SCR",
    "ALL SCR (Cri)",
  ];

  let courts = [
    {
      value: "",
      view: "",
    },
    {
      value: "Bom",
      view: "Bombay High Court",
    },
    {
      value: "SCW",
      view: "SCW",
    },
  ];

  const searchCitation = async () => {
    let q = "";
    let array = [
      {
        field: "equivalentCitation",
        bool: "or",
      },
      {
        field: "equivalentCitation",
        bool: "or",
      },
    ];
    if (inputVolume !== "" && inputPublication !== publications[0]) {
      if (!/^[0-9()]*$/gm.test(inputVolume)) {
        return false;
      }
    }
    switch (inputPublication) {
      case publications[0]:
        if (inputCourt === "SCW") {
          array[0].query = `${inputYear} ${inputPublication} ${inputCourt} ${inputPage}`;
          array[1].query = `${inputYear} ${inputPublication} ${inputCourt} ${inputPage}`;
        } else {
          array[0].query = `${inputPublication} ${inputYear} ${inputCourt} ${inputPage}`;
          array[1].query = `${inputPublication} ${inputYear} ${inputCourt} ${inputPage}`;
        }
        break;
      case publications[1]:
        if (inputVolume === "") {
          array[0].query = `(${inputYear}) ${inputPublication} ${inputPage}`;
          array[1].query = `(${inputYear}) Bom. L.R. ${inputPage}`;
        } else {
          array[0].query = `(${inputYear}) ${inputVolume} ${inputPublication} ${inputPage}`;
          array[1].query = `(${inputYear}) ${inputVolume} Bom. L.R. ${inputPage}`;
        }
        break;
      case publications[2]:
        if (inputVolume === "") {
          array[0].query = `${inputYear} ${inputPublication} ${inputPage}`;
          array[1].query = `${inputYear} Mh. L.J. ${inputPage}`;
        } else {
          array[0].query = `${inputYear}(${inputVolume}) ${inputPublication} ${inputPage}`;
          array[1].query = `${inputYear}(${inputVolume}) Mh. L.J. ${inputPage}`;
        }
        break;
      case publications[7]: //SCC
      case publications[8]: // SCC (Cri)
        if (inputVolume === "") {
          array[0].query = `(${inputYear}) ${inputPublication} ${inputPage}`;
          array[1].query = `(${inputYear}) ${inputPublication} ${inputPage}`;
        } else {
          array[0].query = `(${inputYear}) ${inputVolume} ${inputPublication} ${inputPage}`;
          array[1].query = `(${inputYear}) ${inputVolume} ${inputPublication} ${inputPage}`;
        }
        break;
      default:
        if (inputVolume === "") {
          array[0].query = `${inputYear} ${inputPublication} ${inputPage}`;
          array[1].query = `${inputYear} ${inputPublication} ${inputPage}`;
        } else {
          array[0].query = `${inputYear}(${inputVolume}) ${inputPublication} ${inputPage}`;
          array[1].query = `${inputYear} ${inputPublication} ${inputPage}`;
        }
        break;
    }

    let result = await equalCitationSearch.search(array);
  };
</script>

<div class="w-full max-w-xs">
  <div class="bg-white shadow-md float-right rounded px-4 pt-3 pb-4 mb-2">
    <div class="mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2" for="year">
        Year
      </label>
      <input
        class="shadow appearance-none border rounded w-full py-2 px-3
        text-gray-700 leading-tight focus:border-black"
        id="year"
        type="number"
        min="1950"
        max="2020"
        placeholder="Year"
        name="year"
        bind:value={inputYear}
      />
    </div>
    <div class="mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2">
        Volume No
      </label>
      <input
        class="shadow appearance-none border border rounded w-full py-2 px-3
        text-gray-700 mb-2 leading-tight focus:border-black"
        type="text"
        name="volume"
        bind:value={inputVolume}
      />
    </div>
    <div class="mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2">
        Publication
      </label>
      <select
        class="shadow appearance-none border border rounded w-full py-2 px-3
        text-gray-700 mb-2 leading-tight focus:border-black"
        id="grid-state"
        bind:value={inputPublication}
      >
        {#each publications as publication}
          <option value={publication}>{publication}</option>
        {/each}
      </select>
    </div>
    <div class="mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2">Court</label>
      <select
        class="shadow appearance-none border border rounded w-full py-2 px-3
        text-gray-700 mb-2 leading-tight focus:border-black"
        disabled={!isCourt}
        id="grid-state"
        bind:value={inputCourt}
      >
        {#each courts as court}
          <option value={court.value}>{court.view}</option>
        {/each}
      </select>
    </div>
    <div class="mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2">Page No</label>
      <input
        class="shadow appearance-none border rounded w-full py-2 px-3
        text-gray-700 leading-tight focus:border-black"
        type="number"
        min="1"
        max="10000"
        name="pageno"
        bind:value={inputPage}
      />
    </div>
    <button
      class="primary-btn font-bold py-2 px-4 float-right
      rounded inline-flex items-center"
      on:click={searchCitation}
    >
      Search
    </button>
  </div>
</div>

<style>
  select {
    background-color: white !important;
    border: 1px solid #9e9e9e;
  }
  * {
    outline: none;
  }
  input {
    border: 1px solid #9e9e9e;
  }
</style>
