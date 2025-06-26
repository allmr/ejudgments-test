import FileSaver from "file-saver";

<script context="module">
  /**
   * Print entire pdf pages
   * @param {String} url pdf url
   */
  export const onPrint = (url) => {
    let iframe;
    if (!iframe) {
      iframe = document.createElement("iframe");
      document.body.appendChild(iframe);

      iframe.style.display = "none";
      iframe.onload = function () {
        setTimeout(function () {
          iframe.focus();
          iframe.contentWindow.print();
        }, 1);
      };
    }

    iframe.src = url;
  };


  /**
   * Calculate reading time of entire pdf document
   * @param {String} paraBody pdf text to calculate reading time
   */
  export const calcRT = (paraBody) => {
    const wordsPerMinute = 200; // Average case.

    let textLength = paraBody.split(" ").length; // Split by words
    if (textLength > 0) {
      return Math.ceil(textLength / wordsPerMinute);
    }
  };

  /**
   * Save PDF file
   * @param {Object} options Options for saving PDF
   * @param {String} options.fileUrl URL of the PDF file
   * @param {String} options.name Name of the file to be saved
   */
  export const savePDF = ({ fileUrl, name }) => {
    fetch(fileUrl)
      .then(response => response.blob())
      .then(blob => {
        FileSaver.saveAs(blob, name);
      })
      .catch(error => {
        console.error("Error saving PDF: ", error);
      });
  };

  /**
   * Retrieves the text of a specific page within a PDF Document obtained through pdf.js
   * @param {Integer} pageNum Specifies the number of the page
   * @param {PDFDocument} PDFDocumentInstance The PDF document obtained
   */
  export const getPageText = (pageNum, PDFDocumentInstance) => {
    // Return a Promise that is resolved once the text of the page is retrieved
    return new Promise(function (resolve, reject) {
      PDFDocumentInstance.getPage(pageNum).then(function (pdfPage) {
        // The main trick to obtain the text of the PDF page, use the getTextContent method
        pdfPage.getTextContent().then(function (textContent) {
          var textItems = textContent.items;
          var finalString = "";

          // Concatenate the string of the item to the final string
          for (var i = 0; i < textItems.length; i++) {
            var item = textItems[i];

            finalString += item.str + " ";
          }

          // Resolve promise with the text retrieved from the page
          resolve(finalString);
        });
      });
    });
  };
</script>
