<script>
  import Item from "../utils/Item.svelte";
  import StaticJudgement from "../routes/StaticJudgement.svelte";
  import { onMount } from "svelte";
  import {
    judgementResult,
    citationMapJudgementResult,
  } from "../model/store.js";
  const years = [
	"2025",
    "2024",
    "2023",
    "2022",
    "2021",
    "2020",
    "2019",
    "2018",
    "2017",
    "2016",
    "2015",
    "2014",
    "2013",
    "2012",
    "2011",
    "2010",
    "2009",
    "2008",
    "2007",
    "2006",
    "2005",
    "2004",
    "2003",
    "2002",
    "2001",
    "2000",
    "1999",
    "1998",
    "1997",
    "1996",
    "1995",
    "1994",
    "1993",
    "1992",
    "1991",
    "1990",
    "1989",
    "1988",
    "1987",
    "1986",
    "1985",
    "1984",
    "1983",
    "1982",
    "1981",
    "1980",
    "1979",
    "1978",
    "1977",
    "1976",
    "1975",
    "1974",
    "1973",
    "1972",
    "1971",
    "1970",
    "1969",
    "1968",
    "1967",
    "1966",
    "1965",
    "1964",
    "1963",
    "1962",
    "1961",
    "1960",
    "1959",
    "1958",
    "1957",
    "1956",
    "1955",
    "1954",
    "1953",
    "1952",
    "1951",
    "1950",
  ];
  let judgement = "";
  let items = [];

  const handleCitationData = (event) => {
    judgement = event.detail.judgementData;
    items = event.detail.items;
  };

  onMount(() => {
    judgement = JSON.stringify($citationMapJudgementResult);
    items = $judgementResult;
    localStorage.setItem("casesCitedClick", "false");
  });
</script>

<div id="citationMapBody" class="flex flex-row mt-5">
  <div class="no-print w-1/3 wrapper ">
    <div class="item-margin mr-7 ml-2">
      {#each years as year}
        <Item {year} on:citationData={handleCitationData} />
      {/each}
    </div>
  </div>
  <div class="w-full">
    {#if judgement !== "" && judgement !== "{}"}
      <StaticJudgement {judgement} {items} />
    {/if}
  </div>
</div>

<style>
  .wrapper {
    max-height: 600px;
    overflow-y: scroll;
  }
  @media print {
    .no-print {
      display: none;
    }
  }
  .item-margin {
    margin-top: 0.5rem;
    margin-right: 1.5rem;
  }
  @media only screen and (min-device-width: 1024px) and (max-device-width: 1280px) {
    #citationMapBody {
      margin: 1.5em 0 0 0;
    }
  }
</style>
