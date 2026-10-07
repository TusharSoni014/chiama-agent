const STORAGE_KEY = "chiama:openai-key";

/** Header that carries the visitor's key on each chat request. */
export const OPENAI_KEY_HEADER = "x-openai-key";

/**
 * OpenAI secret keys: `sk-...`, `sk-proj-...`, `sk-svcacct-...`, `sk-admin-...`.
 * Letters, numbers, `_` and `-` after the prefix; at least 32 characters of secret.
 */
const OPENAI_KEY_PATTERN =
  /^sk-(?:proj-|svcacct-|admin-)?[A-Za-z0-9_-]{32,}$/;

/** Returns the trimmed key, or null if it is not an OpenAI secret key. */
export function parseOpenAIKey(value: string | null | undefined): string | null {
  const key = value?.trim() ?? "";
  if (!OPENAI_KEY_PATTERN.test(key)) return null;
  return key;
}

/** The user's own OpenAI key lives only in this browser's localStorage. */
export function getStoredOpenAIKey(): string | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  const key = parseOpenAIKey(stored);
  if (stored && !key) window.localStorage.removeItem(STORAGE_KEY);
  return key;
}

export function setStoredOpenAIKey(key: string) {
  const parsed = parseOpenAIKey(key);
  if (!parsed) return;
  window.localStorage.setItem(STORAGE_KEY, parsed);
}

export function clearStoredOpenAIKey() {
  window.localStorage.removeItem(STORAGE_KEY);
}

/** Quota / rate-limit errors from OpenAI (and similar providers). */
export function isOpenAIUsageLimitError(message: string) {
  return /rate.?limit|too many requests|insufficient.?quota|exceeded your current quota|quota.?exceeded|exhausted|billing|429/i.test(
    message,
  );
}

export const USAGE_LIMIT_HELP =
  "This agent's usage limit was reached. Add your own OpenAI key in Settings to keep going.";
