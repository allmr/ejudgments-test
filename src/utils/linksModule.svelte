<script context="module">
  //to add Our Citation links to the text
  export const addCitationLinks = (string) => {
    const volumes = [
      "ALL SCR \\(ONLINE\\)",
      "ALL SCR",
      "ALL SCR \\(Cri\\)",
      "ALL MR",
      "ALLMR ONLINE",
      "ALL MR \\(SUPREME COURT\\)",
      "ALL MR \\(Cri\\)",
      "ALL MR \\(Cri\\) JOURNAL",
      "ALL MR \\(Cri\\) \\(SUPREME COURT\\)",
      "ALL MR \\(JOURNAL\\)",
      "ALL MR \\(Cri\\) \\(JOURNAL\\)",
      "Nearlaw \\(Mumbai HC\\)",
      "Nearlaw \\(Mumbai HC\\) \\(Cri\\)",
      "Nearlaw \\(Mumbai HC\\) \\(SUPREME COURT\\)",
      "Nearlaw \\(Mumbai HC\\) \\(Cri\\) \\(SUPREME COURT\\)",
      "Nearlaw \\(BombayHC\\) Online",
      "Nearlaw \\(BombayHC Goa\\) Online",
      "Nearlaw \\(BombayHC Nagpur\\) Online",
      "Nearlaw \\(BombayHC Aurangabad\\) Online",
      "Nearlaw \\(DelhiHC\\)",
      "Nearlaw \\(KER\\) Online",
      "Nearlaw \\(KAR\\) Online",
      "Nearlaw \\(GUJ\\) Online",
      "Nearlaw \\(CAL\\) Online",
      "Nearlaw \\(PUN\\) Online",
      "Nearlaw \\(ALH\\) Online",
    ];

    try {
      let regLink = new RegExp(
        `([0-9]{4})(\\([0-9]{1}\\))? ((${volumes.join(
          ")|("
        )})) ([0-9]+)( \\(S.C.\\))?`,
        "gm"
      );

      let links = string.match(regLink);

      for (let i = 0; i < links.length; i++) {
        string = string.replace(
          links[i],
          `<a style="cursor:pointer;" class="links text-black underline">${links[i]}</a>`
        );
      }
    } catch (error) {
      return string;
    }
    return string;
  };

  /*
	To add paragraph links to the strings
*/
  export const addParaLinks = (string) => {
    try {
      let para = string.match(/(\(|\[)(Paras|Para) (.*?)(\]|\))/gm);
      if (para != null) {
        let a = para.map((element) => {
          return element.replace(/\d+(\d+)*/gm, function (x) {
            return `<span style="cursor:pointer;" class="text-blue-800 paralinks">${x}</span>`;
          });
        });
        for (let index = 0; index < para.length; index++) {
          string = string.replace(para[index], a[index]);
        }
      }
    } catch (e) {
      console.error(e);
    }
    return string;
  };
</script>
