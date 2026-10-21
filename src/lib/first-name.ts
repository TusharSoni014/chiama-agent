const MAX_FIRST_NAME_LENGTH = 30;

/**
 * First word of a display name, or `undefined` when there is nothing usable.
 * Only letters, marks, apostrophes and hyphens are kept: the voice server gets
 * this from the browser and puts it into the agent's prompt.
 */
export function toFirstName(name: unknown): string | undefined {
  if (typeof name !== "string") return undefined;
  const first = name.trim().split(/\s+/)[0] ?? "";
  const clean = first.replace(/[^\p{L}\p{M}'-]/gu, "");
  return clean ? clean.slice(0, MAX_FIRST_NAME_LENGTH) : undefined;
}
