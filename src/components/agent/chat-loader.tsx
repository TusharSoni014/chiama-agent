"use client";

import { useEffect, useState, type ComponentProps } from "react";
import Link from "next/link";
import type { UIMessage } from "ai";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAgentStore } from "@/stores/agent-store";
import { ChatConversation } from "./chat-conversation";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; messages: UIMessage[] }
  | { status: "not-found" }
  | { status: "error" };

/** Loads the saved messages of `/agent/<chatId>` in the browser, then shows the chat. */
export function ChatLoader({
  chatId,
  fresh = false,
  onFirstMessage,
}: {
  chatId: string;
  /** New chat on `/agent`: show the composer immediately, with no thread fetch. */
  fresh?: boolean;
  /** Called once, when the first message of a new chat is sent. */
  onFirstMessage?: () => void;
}) {
  // Bumped when a voice call is saved, so the chat reloads with its new messages.
  const reloadToken = useAgentStore((state) => state.chatReloadToken);
  const key = `${chatId}:${reloadToken}`;
  // A new chat has nothing to load. Skip that first fetch, including under Strict Mode.
  const [skippedKey] = useState(() => (fresh ? key : ""));
  const [state, setState] = useState<LoadState>(
    fresh ? { status: "ready", messages: [] } : { status: "loading" },
  );
  const [loadedKey, setLoadedKey] = useState(() => (fresh ? key : ""));

  // Reset during render when the chat changes, so the skeleton shows right away.
  if (loadedKey !== key) {
    setLoadedKey(key);
    setState({ status: "loading" });
  }

  useEffect(() => {
    if (skippedKey === key) return;

    const controller = new AbortController();

    fetch(`/api/chat/threads/${encodeURIComponent(chatId)}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (res.status === 404) return setState({ status: "not-found" });
        if (!res.ok) return setState({ status: "error" });
        const data = (await res.json()) as { messages: UIMessage[] };
        setState({ status: "ready", messages: data.messages });
      })
      .catch((error) => {
        if (error?.name !== "AbortError") setState({ status: "error" });
      });

    return () => controller.abort();
  }, [chatId, key, reloadToken, skippedKey]);

  const reduce = useReducedMotion();
  const fade = {
    initial: { opacity: 0, y: reduce ? 0 : 6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0 },
    transition: { duration: reduce ? 0 : 0.35, ease: [0.23, 1, 0.32, 1] as const },
  };

  // Skeleton fades out, then the chat (or the error) fades in.
  const view = state.status === "loading" ? "loading" : `${state.status}:${key}`;

  return (
    <AnimatePresence mode="wait">
      {state.status === "loading" ? (
        <ChatSkeleton key={view} {...fade} />
      ) : state.status === "ready" ? (
        <motion.div key={view} className="flex min-h-0 flex-1 flex-col" {...fade}>
          <ChatConversation
            threadId={chatId}
            initialMessages={state.messages}
            onFirstMessage={onFirstMessage}
          />
        </motion.div>
      ) : (
        <motion.div
          key={view}
          className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center"
          {...fade}
        >
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">
              {state.status === "not-found"
                ? "Chat not found"
                : "Could not load chat"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {state.status === "not-found"
                ? "This chat doesn't exist, or it belongs to another account."
                : "Something went wrong while loading this chat."}
            </p>
          </div>
          <Link href="/agent" className={buttonVariants()}>
            Start new chat
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ChatSkeleton(props: ComponentProps<typeof motion.div>) {
  return (
    <motion.div
      className="flex min-h-0 flex-1 flex-col"
      aria-busy="true"
      {...props}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 overflow-hidden px-4 py-6">
        <Skeleton className="ml-auto h-10 w-2/5 bg-white/10" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-full bg-white/10" />
          <Skeleton className="h-4 w-11/12 bg-white/10" />
          <Skeleton className="h-4 w-3/5 bg-white/10" />
        </div>
        <Skeleton className="ml-auto h-10 w-1/3 bg-white/10" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-full bg-white/10" />
          <Skeleton className="h-4 w-4/5 bg-white/10" />
        </div>
      </div>
      <div className="mx-auto w-full max-w-3xl px-4 pb-4">
        <Skeleton className="h-14 w-full rounded-2xl bg-white/10" />
      </div>
    </motion.div>
  );
}
