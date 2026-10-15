import { writable } from "svelte/store";

/** Hook input formulir berbasis Svelte store. */
export function useInput(initialValue = "") {
  const value = writable(initialValue);
  const onChange = (event: Event) =>
    value.set((event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value);
  const reset = () => value.set(initialValue);
  return { value, onChange, reset };
}
