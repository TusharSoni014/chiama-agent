"use client";

import { useEffect, useState } from "react";
import type { UIMessage } from "ai";

type HistoryState =
  | { status: "loading" }
  | { status: "ready"; messages: UIMessage[] }
  | { status: "error"; message: string };

/**
 * Loads the saved messages of a thread. Drafts have no history, so they are
 * ready immediately. Remount (via `key`) to load a different thread.
 */
export function useThreadHistory(threadId: string, isDraft: boolean) {
  const [state, setState] = useState<HistoryState>(
    isDraft ? { status: "ready", messages: [] } : { status: "loading" }
  );

  useEffect(() => {
    if (isDraft) return;

    const controller = new AbortController();

    const load = async () => {
      try {
        const res = await fetch(
          `/api/chat?threadId=${encodeURIComponent(threadId)}`,
          { cache: "no-store", signal: controller.signal }
        );
        if (!res.ok) throw new Error("Could not load this conversation.");
        const messages: UIMessage[] = await res.json();
        setState({ status: "ready", messages });
      } catch (err) {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          message:
            err instanceof Error ? err.message : "Could not load this conversation.",
        });
      }
    };

    void load();
    return () => controller.abort();
  }, [threadId, isDraft]);

  return state;
}
