"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ChatThread } from "@/components/agent/types";

const THREADS_ENDPOINT = "/api/chat/threads";
const LOAD_ERROR = "Could not load your conversations.";

async function readError(res: Response, fallback: string) {
  try {
    const data = await res.json();
    if (typeof data?.error === "string") return data.error;
  } catch {
    // Body was not JSON, use the fallback message.
  }
  return fallback;
}

async function fetchThreads(): Promise<ChatThread[]> {
  const res = await fetch(THREADS_ENDPOINT, { cache: "no-store" });
  if (!res.ok) throw new Error(await readError(res, LOAD_ERROR));
  return res.json();
}

export function useChatThreads() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applyResult = useCallback(
    (result: ChatThread[] | Error) => {
      if (result instanceof Error) {
        setError(result.message);
      } else {
        setThreads(result);
        setError(null);
      }
      setIsLoading(false);
    },
    []
  );

  const refresh = useCallback(async () => {
    applyResult(await fetchThreads().catch((err: Error) => err));
  }, [applyResult]);

  useEffect(() => {
    let cancelled = false;

    fetchThreads()
      .catch((err: Error) => err)
      .then((result) => {
        if (!cancelled) applyResult(result);
      });

    return () => {
      cancelled = true;
    };
  }, [applyResult]);

  /** Shows a conversation in the sidebar right away, before the server list refreshes. */
  const addThread = useCallback((thread: ChatThread) => {
    setThreads((prev) =>
      prev.some((item) => item.id === thread.id) ? prev : [thread, ...prev]
    );
  }, []);

  const removeThread = useCallback(async (threadId: string) => {
    const res = await fetch(
      `${THREADS_ENDPOINT}?threadId=${encodeURIComponent(threadId)}`,
      { method: "DELETE" }
    );
    if (!res.ok) {
      throw new Error(await readError(res, "Could not delete the conversation."));
    }
    setThreads((prev) => prev.filter((thread) => thread.id !== threadId));
  }, []);

  return { threads, isLoading, error, refresh, addThread, removeThread };
}

/** The workspace owns the thread list; the chat page reads it from here. */
export const ChatThreadsContext = createContext<ReturnType<
  typeof useChatThreads
> | null>(null);

export function useChatThreadsContext() {
  const threads = useContext(ChatThreadsContext);
  if (!threads) throw new Error("Chat threads are only available inside the agent workspace.");
  return threads;
}
