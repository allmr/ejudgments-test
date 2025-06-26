import FlexSearch from "flexsearch";
import Rdata from "./respondentData";
import Pdata from "./petitionerData";
import Jdata from "./judgeData";
import ActData from "./actNameData";
import adv_data from "./adv_data";
import citationData from "./CitationData";
import autoFillData from "./autoFillData";
import equivalentCitationData from "./equalCitationData";
import casesCitedData from "./CasesCitedData";
import partyNameData from "./partyNameData";
import statusData from "./statusData";

// FlexSearch.registerEncoder("ActAbbrevation",function(str){
//   if(/Civil P.C./gm.test(str)){
//     str = 'Code of Civil Procedure, 1908';
//   }else if(/Criminal P.C./gm.test(str)){
//     str = 'Code of Criminal Procedure, 1973';
//   }else if(/IPC/gm.test(str)){
//     str = 'Indian Penal Code, 1860';
//   }
//   return str;
// });

export const respondentSearch = new FlexSearch({
  encode: "icase",
  doc: {
    id: "id",
    field: ["view"],
  },
});

export const petitionerSearch = new FlexSearch({
  encode: "icase",
  doc: {
    id: "id",
    field: ["view"],
  },
});

export const judgeNameSearch = new FlexSearch({
  encode: "icase",
  doc: {
    id: "id",
    field: ["Judge_name"],
  },
});

export const advocateNameSearch = new FlexSearch({
  encode: "icase",
  doc: {
    id: "id",
    field: ["name"],
  },
});

export const actNameSearch = new FlexSearch({
  encode: "icase",
  doc: {
    id: "id",
    field: ["view"],
  },
});

export const equalCitationDataSearch = new FlexSearch({
  doc: {
    id: "id",
    field: ["view"],
  },
});

export const autoFillSearch = new FlexSearch({
  encode: "icase",
  doc: {
    id: "id",
    field: ["view"],
  },
});

export const partyNameSearch = new FlexSearch({
  encode: "icase",
  doc: {
    id: "id",
    field: ["partyName"],
  },
});

export const citationSearch = new FlexSearch({
  tokenize: "strict",
  doc: {
    id: "id",
    field: ["Citation"],
  },
});

export const statusCheck = new FlexSearch({
  doc: {
    id: "id",
    field: [
      "overRuledCitation",
      "status[statusId]",
      "status[statusText]",
      "status[overRulingCitation]",
    ],
  },
});

export const casesCitedDataSearch = new FlexSearch({
  doc: {
    id: "id",
    field: ["citation"],
  },
});

export const partyNameDataSearch = new FlexSearch({
  doc: {
    id: "id",
    field: ["partyName"],
  },
});

statusCheck.add(statusData);
equalCitationDataSearch.add(equivalentCitationData);
autoFillSearch.add(autoFillData);
partyNameSearch.add(partyNameData);
citationSearch.add(citationData);
actNameSearch.add(ActData);
respondentSearch.add(Rdata);
petitionerSearch.add(Pdata);
judgeNameSearch.add(Jdata);
advocateNameSearch.add(adv_data);
casesCitedDataSearch.add(casesCitedData);
partyNameDataSearch.add(partyNameData);
