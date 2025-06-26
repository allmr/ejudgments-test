<script>
  import { getContext } from "svelte";
  import Dialog from "./Dailog.svelte";
  import { dark, mobileNumber } from "../model/store";
  import { success, failure } from "../utils/Toast";
  import Fa from "svelte-fa";
  import { faNotesMedical } from "@fortawesome/free-solid-svg-icons";
  import axios from "axios";

  export let message;
  export let isAnnotated;
  export let text;

  let annotationText = text || "";
  let status = 0;

  const AUTH_HEADER = {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic QUxMTVJPTkxJTkVfQVVUSDo0VDlYM1A3UVo2TDFCOFY1"
    }
  };

  const { open } = getContext("simple-modal");



const onOkay = async (textValue) => {
  try {
    const trimmedText = textValue.trim();

    if (!trimmedText) {
      // Delete if annotation is empty
      const deleteResponse = await axios.delete(
        `https://ejudgments.com:4999/api/annotation/${$mobileNumber}/`,
        {
          ...AUTH_HEADER,
          data: { citation: message }
        }
      );
      if (deleteResponse.status === 200) {
        success("Annotation deleted successfully!");
        text = "";
        isAnnotated = false;
        window.dispatchEvent(new CustomEvent('annotationUpdated', {
          detail: { citation: message, annotation: "", isAnnotated: false }
        }));
      }
      return;
    }

    // Update or Add annotation if textValue is not empty
    if (isAnnotated) {
      const response = await axios.put(
        `https://ejudgments.com:4999/api/annotation/${$mobileNumber}/`,
        { citation: message, annotation: trimmedText },
        AUTH_HEADER
      );
      if (response.status === 200) {
        success("Annotation updated successfully!");
        text = trimmedText;
        isAnnotated = true;
        window.dispatchEvent(new CustomEvent('annotationUpdated', {
          detail: { citation: message, annotation: trimmedText, isAnnotated: true }
        }));
      }
    } else {
      const response = await axios.post(
        `https://ejudgments.com:4999/api/annotation/${$mobileNumber}/`,
        { citation: message, annotation: trimmedText },
        AUTH_HEADER
      );
      if (response.status === 201) {
        success("Annotation added successfully!");
        text = trimmedText;
        isAnnotated = true;
        window.dispatchEvent(new CustomEvent('annotationUpdated', {
          detail: { citation: message, annotation: trimmedText, isAnnotated: true }
        }));
      }
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.status === 422){
      failure("Annotation is missing. Please enter some text.");
    } else {
      failure("Something went wrong while saving annotation");
    }
  }
};

const onDelete = async () => {
  try {
    const response = await axios.delete(
      `https://ejudgments.com:4999/api/annotation/${$mobileNumber}/`,
      {
        ...AUTH_HEADER,
        data: { citation: message }
      }
    );
    if (response.status === 200) {
      success("Annotation deleted successfully!");
      text = "";
      isAnnotated = false;
      // Trigger parent component update
      window.dispatchEvent(new CustomEvent('annotationUpdated', { 
        detail: { citation: message, annotation: "", isAnnotated: false }
      }));
    }
  } catch (err) {
    console.log(err);
    failure("Something went wrong while deleting annotation");
  }
};

  const showDialog = () => {
    open(
      Dialog,
      {
        message,
        text,
        hasForm: true,
        onOkay,
        onDelete: isAnnotated ? onDelete : null
      },
      {
        closeButton: true,
        closeOnEsc: true,
        closeOnOuterClick: true
      }
    );
  };
</script>

{#if isAnnotated}
  <span
    class="flex mx-2 rounded overflow-hidden shadow-lg border cursor-pointer bg-blue-500 text-white"
    class:dark-selected={$dark}
    on:click={showDialog}
  >
    <span class="flex my-auto">
      <Fa icon={faNotesMedical} scale={0.5} size="2x" />
    </span>
    <span class="flex my-2 ml-1 mr-3">Annotation</span>
  </span>
{:else}
  <span
    class="flex mx-2 rounded overflow-hidden shadow-lg border cursor-pointer bg-white"
    class:dark={$dark}
    on:click={showDialog}
  >
    <span class="flex my-auto">
      <Fa icon={faNotesMedical} scale={0.5} size="2x" />
    </span>
    <span class="flex my-2 ml-1 mr-3">Annotation</span>
  </span>
{/if}
