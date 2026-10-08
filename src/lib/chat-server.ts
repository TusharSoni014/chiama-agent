import { RequestContext } from "@mastra/core/request-context";
import { toAISdkMessages } from "@mastra/ai-sdk/ui";
import type { UIMessage } from "ai";
import { mastra } from "@/mastra";
import { OPENAI_KEY_CONTEXT } from "@/mastra/modelConfig";
import { auth } from "@/lib/auth";
import { OPENAI_KEY_HEADER, parseOpenAIKey } from "@/lib/openai-key-storage";
import { DEFAULT_CHAT_TITLE, toChatTitle } from "@/lib/chat-title";

import { DEFAULT_CHAT_AGENT_ID, isChatAgentId } from "@/lib/chat-agents";

/** Agent whose memory is used to read/write threads (storage is shared by all agents). */
export const CHAT_AGENT_ID = DEFAULT_CHAT_AGENT_ID;

/** Agent that should answer a request; falls back to the default if unknown. */
export function resolveChatAgentId(value: unknown) {
  return isChatAgentId(value) ? value : DEFAULT_CHAT_AGENT_ID;
}

/**
 * Resource that owns every thread for the current visitor.
 * Returns `null` for anonymous visitors: their chats are never saved.
 */
export async function getChatResourceId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

/**
 * The visitor's own OpenAI key, if they sent one, as a request context for this
 * single call. It is never saved, logged, or put in memory.
 */
export function getUserKeyContext(req: Request) {
  const key = parseOpenAIKey(req.headers.get(OPENAI_KEY_HEADER));
  if (!key) return {};
  return { requestContext: new RequestContext([[OPENAI_KEY_CONTEXT, key]]) };
}

export async function getChatMemory() {
  return mastra.getAgentById(CHAT_AGENT_ID).getMemory();
}

/**
 * Looks up a chat by the id in the URL.
 * `allowed` is false when this user has no such chat, so the page should say "not found".
 */
export async function openChat(threadId: string) {
  const resourceId = await getChatResourceId();
  const memory = await getChatMemory();
  if (!memory) throw new Error("Chat memory is unavailable.");

  const thread = await memory.getThreadById({ threadId });
  if (!thread || thread.resourceId !== resourceId) {
    return { allowed: false, messages: [] as UIMessage[] };
  }

  const saved = await memory.recall({ threadId, resourceId: thread.resourceId });
  return {
    allowed: true,
    messages: toAISdkMessages(saved?.messages ?? [], { version: "v7" }),
  };
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
