import { mastra } from "@/mastra";
import { auth } from "@/lib/auth";
import { DEFAULT_CHAT_TITLE, toChatTitle } from "@/lib/chat-title";

import { DEFAULT_CHAT_AGENT_ID, isChatAgentId } from "@/lib/chat-agents";

/** Agent whose memory is used to read/write threads (storage is shared by all agents). */
export const CHAT_AGENT_ID = DEFAULT_CHAT_AGENT_ID;

/** Agent that should answer a request; falls back to the default if unknown. */
export function resolveChatAgentId(value: unknown) {
  return isChatAgentId(value) ? value : DEFAULT_CHAT_AGENT_ID;
}

const DEFAULT_RESOURCE = "weather-chat";

/**
 * Resource that owns every thread for the current visitor.
 * Signed-in users get their own resource, anonymous visitors share one.
 */
export async function getChatResourceId(): Promise<string> {
  const session = await auth();
  return session?.user?.id ?? DEFAULT_RESOURCE;
}

export async function getChatMemory() {
  return mastra.getAgentById(CHAT_AGENT_ID).getMemory();
}

/** Builds a short sidebar title from the latest user message of a request. */
export function deriveThreadTitle(messages: unknown): string {
  if (!Array.isArray(messages)) return DEFAULT_CHAT_TITLE;

  const lastUserMessage = [...messages]
    .reverse()
    .find((message) => message?.role === "user");

  const text = Array.isArray(lastUserMessage?.parts)
    ? lastUserMessage.parts
        .filter((part: { type?: string }) => part?.type === "text")
        .map((part: { text?: string }) => part.text ?? "")
        .join(" ")
    : "";

  return toChatTitle(text);
}

export function errorResponse(message: string, status: number) {
  return new Response(message, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
