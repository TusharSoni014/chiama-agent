"use client";

import { createContext, useCallback, useContext } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { ChatThread } from "@/components/agent/types";

const THREADS_ENDPOINT = "/api/chat/threads";
const THREADS_KEY = ["threads"] as const;
const LOAD_ERROR = "Could not load your conversations.";
const NO_THREADS: ChatThread[] = [];

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

async function deleteThread(threadId: string) {
  const res = await fetch(
    `${THREADS_ENDPOINT}?threadId=${encodeURIComponent(threadId)}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error(await readError(res, "Could not delete the conversation."));
  }
}

export function useChatThreads() {
  const queryClient = useQueryClient();

  const query = useQuery({ queryKey: THREADS_KEY, queryFn: fetchThreads });

  /** Loads the list again. A failure shows as `error`; the old list stays. */
  const refresh = useCallback(
    () => queryClient.invalidateQueries({ queryKey: THREADS_KEY }),
    [queryClient]
  );

  /** Shows a conversation in the sidebar right away, before the server list refreshes. */
  const addThread = useCallback(
    (thread: ChatThread) => {
      queryClient.setQueryData<ChatThread[]>(THREADS_KEY, (prev = NO_THREADS) =>
        prev.some((item) => item.id === thread.id) ? prev : [thread, ...prev]
      );
    },
    [queryClient]
  );

  const { mutateAsync: removeThread } = useMutation({
    mutationFn: deleteThread,
    onSuccess: (_data, threadId) => {
      queryClient.setQueryData<ChatThread[]>(THREADS_KEY, (prev = NO_THREADS) =>
        prev.filter((thread) => thread.id !== threadId)
      );
    },
  });

  return {
    threads: query.data ?? NO_THREADS,
    // True until the first load finishes, whether it worked or failed.
    isLoading: query.isPending,
    error: query.error?.message ?? null,
    refresh,
    addThread,
    removeThread,
  };
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
