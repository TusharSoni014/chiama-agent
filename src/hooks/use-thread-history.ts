"use client";

import { useQuery } from "@tanstack/react-query";
import type { UIMessage } from "ai";

/** The request failed. `status` lets the UI tell "no such chat" (404) from other errors. */
export class ThreadHistoryError extends Error {
  constructor(readonly status: number) {
    super(`Could not load chat (${status})`);
  }
}

async function fetchThreadHistory(
  chatId: string,
  signal: AbortSignal,
): Promise<UIMessage[]> {
  const res = await fetch(`/api/chat/threads/${encodeURIComponent(chatId)}`, {
    signal,
  });
  if (!res.ok) throw new ThreadHistoryError(res.status);
  const data = (await res.json()) as { messages: UIMessage[] };
  return data.messages;
}

interface UseThreadHistoryOptions {
  chatId: string;
  /** Changes when the chat must be loaded again (a saved voice call added messages). */
  reloadToken: number;
  /** False for a brand-new chat: there is nothing on the server yet. */
  enabled: boolean;
}

/**
 * Saved messages of one chat.
 *
 * They are only used to start `useChat`, which then owns the live messages. So
 * a finished query is dropped as soon as the chat closes (`gcTime: 0`): coming
 * back must load fresh, or the chat would open without the replies it got since.
 */
export function useThreadHistory({
  chatId,
  reloadToken,
  enabled,
}: UseThreadHistoryOptions) {
  return useQuery({
    queryKey: ["thread-history", chatId, reloadToken],
    queryFn: ({ signal }) => fetchThreadHistory(chatId, signal),
    enabled,
    gcTime: 0,
  });
}
