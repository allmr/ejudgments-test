<script context="module">
  import { history_db } from "../model/store.js";
  import { status_checker_history_db } from "../model/store.js";
  export const save = (viewArray, queryString) => {
    let hData = {
      view: viewArray,
      query: queryString,
      time: Date.now(),
    };
    history_db
      .post(hData)
      .then(function (result) {
        console.log(result);
      })
      .catch(function (err) {
        console.log(err);
      });
  };

  export const saveStatusCheckerHistory = (viewArray, queryString) => {
    let hData = {
      view: viewArray,
      query: queryString,
      time: Date.now(),
    };
    status_checker_history_db
      .post(hData)
      .then(function (result) {
        console.log(result);
      })
      .catch(function (err) {
        console.log(err);
      });
  };
</script>
