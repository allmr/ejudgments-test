import { toast } from "@zerodevx/svelte-toast";

export const success = (m) =>
  toast.push(m, {
    theme: {
      "--toastBarBackground": "none",
      "--toastBackground": "#4BB543",
      "--toastColor": "white",
      "--toastBarBackground": "none",
    },
  });

export const failure = (m) =>
  toast.push(m, {
    theme: {
      "--toastBackground": "#C53030",
      "--toastBarBackground": "none",
    },
  });

export const deafult = (m) =>
  toast.push(m, {
    theme: {
      "--toastBackground": "#D3D3D3",
      "--toastColor": "black",
      "--toastBarBackground": "none",
    },
  });
