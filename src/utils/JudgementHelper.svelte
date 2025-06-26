<script context="module">
  export const calcRT = (paraBody) => {
    const wordsPerMinute = 200; // Average case.

    let textLength = paraBody.split(" ").length; // Split by words
    if (textLength > 0) {
      return Math.ceil(textLength / wordsPerMinute);
    }
  };

  // Zoom-IN button function
  let zoomCount = 10;
  let zoomCurrent = 100;
  export const zoomIn = (element) => {
    console.log("Zoom IN!");
    zoomCurrent += zoomCount;
    if (zoomCurrent <= 170) {
      element.style.fontSize = `${zoomCurrent}%`;
    }
  };
  // Zoom-Out button function
  export const zoomOut = (element) => {
    zoomCurrent -= zoomCount;
    if (zoomCurrent >= 70) {
      element.style.fontSize = `${zoomCurrent}%`;
    }
  };

  export const print = () => window.print();

  export const darkMode = () => {
    document.body.classList.toggle("dark-mode");
  };

  export const exportCSV = (tableData, includeHeaders = true) => {
    let rows = Array.from(tableData.querySelectorAll("tr"));
    rows.map((v, i) => {
      rows.splice(i + 2, 1); //Removed HeadNote from Table
    });
    if (!includeHeaders && rows[0].querySelectorAll("th").length) {
      rows.shift();
    }
    const lines = [];
    const numCols = rows.reduce(
      (l, row) => (row.childElementCount > l ? row.childElementCount : l),
      0
    );
    for (const row of rows) {
      let line = "";
      for (let i = 0; i < numCols; i++) {
        if (row.children[i] !== undefined) {
          let parsedValue = row.children[i].textContent;
          // Replace all double quotes with two double quotes
          parsedValue = parsedValue.replace(/"/g, `""`);
          // If value contains comma, new-line or double-quote, enclose in double quotes
          parsedValue = /[",\n]/.test(parsedValue)
            ? `"${parsedValue}"`
            : parsedValue;
          line += parsedValue;
        }
        line += i !== numCols - 1 ? "," : "";
      }
      lines.push(line);
    }
    lines[0] = lines[0].replace(",Judgement", ""); //Removed Judgement named table header
    const csvOutput = lines.join("\n");
    const csvBlob = new Blob([csvOutput], { type: "text/csv" });
    const blobUrl = URL.createObjectURL(csvBlob);
    const anchorElement = document.createElement("a");

    anchorElement.href = blobUrl;
    anchorElement.download = "table-export.csv";
    anchorElement.click();
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 500);
  };
</script>
