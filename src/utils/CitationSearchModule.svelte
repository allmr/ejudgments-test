<script context="module">
  import axios from "axios";
  import { baseUrl, USERNAME, PASSWORD } from "../model/store.js";
  import { save } from "./historyModule.svelte";

  /*To search Citation from elastic search*/
  export const citationElasticSearch = async (
    citation,
    saveHistory = false
  ) => {
    let data = {
      from: 0,
      size: 100,
      query: {
        bool: {
          must: [
            {
              simple_query_string: {
                fields: ["Citation"],
                query: `"${citation}"`,
              },
            },
          ],
        },
      },
    };

    let result = await axios({
      url: `${baseUrl}/judgement/nearlaw/_search`,
      auth: {
        username: USERNAME, //change value if required in model/stote.js
        password: PASSWORD, //change value if required in model/store.js
      },
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: data,
    });

    if (saveHistory && result.data.hits.total.value !== 0) {
      save([`Citation : ${citation}`], data);
      return result;
    }
    if (result.data.hits.total.value === 0) {
      return false;
    }
    return result;
  };
</script>
