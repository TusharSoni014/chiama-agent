const MAX_TITLE_LENGTH = 48;
export const DEFAULT_CHAT_TITLE = "New chat";

/** Collapses whitespace and shortens a message into a sidebar-friendly title. */
export function toChatTitle(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return DEFAULT_CHAT_TITLE;

  return clean.length > MAX_TITLE_LENGTH
    ? `${clean.slice(0, MAX_TITLE_LENGTH).trimEnd()}...`
    : clean;
}
