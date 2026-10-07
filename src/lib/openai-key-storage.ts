const STORAGE_KEY = "chiama:openai-key";

/** Header that carries the visitor's key on each chat request. */
export const OPENAI_KEY_HEADER = "x-openai-key";

/** The user's own OpenAI key lives only in this browser's localStorage. */
export function getStoredOpenAIKey(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

export function setStoredOpenAIKey(key: string) {
  window.localStorage.setItem(STORAGE_KEY, key);
}

export function clearStoredOpenAIKey() {
  window.localStorage.removeItem(STORAGE_KEY);
}
