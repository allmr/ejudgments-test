import { writable } from "svelte/store";
import PouchDB from "pouchdb-browser";
import plugin from "pouchdb-find";
import * as A from "../../alphabets/A.json";
import * as B from "../../alphabets/B.json";
import * as C from "../../alphabets/C.json";
import * as D from "../../alphabets/D.json";
import * as E from "../../alphabets/E.json";
import * as F from "../../alphabets/F.json";
import * as G from "../../alphabets/G.json";
import * as H from "../../alphabets/H.json";
import * as I from "../../alphabets/I.json";
import * as J from "../../alphabets/J.json";
import * as K from "../../alphabets/K.json";
import * as L from "../../alphabets/L.json";
import * as M from "../../alphabets/M.json";
import * as N from "../../alphabets/N.json";
import * as O from "../../alphabets/O.json";
import * as P from "../../alphabets/P.json";
import * as Q from "../../alphabets/Q.json";
import * as R from "../../alphabets/R.json";
import * as S from "../../alphabets/S.json";
import * as T from "../../alphabets/T.json";
import * as U from "../../alphabets/U.json";
import * as V from "../../alphabets/V.json";
import * as W from "../../alphabets/W.json";
import * as X from "../../alphabets/X.json";
import * as Y from "../../alphabets/Y.json";
import * as Z from "../../alphabets/Z.json";
PouchDB.plugin(plugin);

// Opening Modal User Information
export const advocateName = writable("");
export const mobileNumber = writable("");

// Index Search
export const citation = writable("");

// Act Search Component Case Search
export const actData = writable([]);
export const actHistory = writable([]);
export const actSearch = writable([]);
export const actHighlight = writable("");

// Cases Cited Search Component Case Search
export const casesCitedData = writable([]);
export const casesCitedHistory = writable([]);
export const casesCitedHighlight = writable("");

// Headnote Search Component Case Search
export const headNoteList = writable([]);

// Party Name Search Component Case Search
export const partyNameList = writable([]);

// Party Name Search Component Case Search
export const partyNameData = writable([]);
export const partyNameHistory = writable([]);
export const partyNameHighlight = writable("");

// Full Text Search Component Case Search
export const fullTextList = writable([]);

// Petitioner Search Component Case Search
export const PetitionerName = writable("");
export const petitionerInfo = writable([]);

// Respondent Search Component Case Search
export const RespondentName = writable("");
export const respondentInfo = writable([]);

// Judge Name Search Component Case Search
export const JudgeName = writable("");
export const judgeInfo = writable([]);
export const JudgeNameList = writable([]);

// Advocate Name Search Component Index Search
export const AdvocateName = writable("");
export const advocateInfo = writable([]);

// contains an object of data.
export const judgementResult = writable([]);
export const fullJudgementResult = writable([]);
export const citationMapJudgementResult = writable({});
export const fullJudgementData = writable({});
export const totalRecords = writable("");
export const previousEvent = writable("");
export const status = writable("");
export const highlight = writable([]);
export const baseUrl = "https://test.com:4000";
export const bookmark_db = new PouchDB("allmr-bookmark");
export const anotation_db = new PouchDB("allmr-anotation");
export const history_db = new PouchDB("allmr-history");
export const status_checker_history_db = new PouchDB("allmr-status-checker-history");
export const userDetails = new PouchDB("userDetials");
export const openAccordian = writable(0);
export const findWords = writable([]);
export const dark = writable(0);
export const query = writable({});
export const USERNAME = "test";
export const PASSWORD = "test";
// export const PASSWORD = "admin";

export const boost = [
    {
        range: {
            doj_sort: {
                gte: "1995-01-01 00:00:00",
                lte: "2000-01-01 00:00:00",
                boost: 5,
            },
        },
    },
    {
        range: {
            doj_sort: {
                gte: "2001-01-01 00:00:00",
                lte: "2005-01-01 00:00:00",
                boost: 6,
            },
        },
    },
    {
        range: {
            doj_sort: {
                gte: "2006-01-01 00:00:00",
                lte: "2010-01-01 00:00:00",
                boost: 7.5,
            },
        },
    },
    {
        range: {
            doj_sort: {
                gte: "2010-01-01 00:00:00",
                lte: "2015-01-01 00:00:00",
                boost: 9.5,
            },
        },
    },
    {
        range: {
            doj_sort: {
                gte: "2016-01-01 00:00:00",
                lte: "2018-01-01 00:00:00",
                boost: 11,
            },
        },
    },
    {
        range: {
            doj_sort: {
                gte: "2018-01-01 00:00:00",
                boost: 12.5,
            },
        },
    },
];
export const letters = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ];
export const alpha = {
    A: A,
    B: B,
    C: C,
    D: D,
    E: E,
    F: F,
    G: G,
    H: H,
    I: I,
    J: J,
    K: K,
    L: L,
    M: M,
    N: N,
    O: O,
    P: P,
    Q: Q,
    R: R,
    S: S,
    T: T,
    U: U,
    V: V,
    W: W,
    X: X,
    Y: Y,
    Z: Z,
};