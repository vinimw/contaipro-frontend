const storageKey = "contaipro:values-hidden";
const listeners = new Set<() => void>();

let hidden = false;
let loaded = false;

function load() {
  if (loaded || typeof window === "undefined") {
    return;
  }

  loaded = true;

  try {
    hidden = window.localStorage.getItem(storageKey) === "1";
  } catch {
    hidden = false;
  }
}

export function areValuesHidden() {
  load();

  return hidden;
}

export function setValuesHidden(next: boolean) {
  load();
  hidden = next;

  try {
    window.localStorage.setItem(storageKey, next ? "1" : "0");
  } catch {
    // Storage can be unavailable (private mode); the preference then lasts only for this page.
  }

  listeners.forEach((listener) => listener());
}

export function subscribeToValuesVisibility(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
