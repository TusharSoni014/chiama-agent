"use client";

import { useCallback, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

/**
 * The chat on screen. A `draft` is a new chat whose id is made in the browser;
 * `urlLive` turns true once its own `/agent/<id>` address is in the address bar.
 * A `saved` chat already exists on the server.
 */
export type ChatPanel =
  | { type: "draft"; id: string; urlLive: boolean }
  | { type: "saved"; id: string };

function createDraft(): ChatPanel {
  return { type: "draft", id: crypto.randomUUID(), urlLive: false };
}

function readChatId(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

/**
 * Keeps track of which chat is open and keeps it in step with the URL.
 * `/agent` is an empty draft. `/agent/<id>` is a saved chat, or a draft whose
 * first message just created that id.
 */
export function useChatPanel() {
  const router = useRouter();
  const chatId = readChatId(useParams().chatId);
  const urlId = chatId ?? null;

  const [panel, setPanel] = useState<ChatPanel>(() =>
    chatId ? { type: "saved", id: chatId } : createDraft(),
  );

  // When the URL changes (link, back button, router call), bring the panel in line.
  const seenUrl = useRef(urlId);
  if (seenUrl.current !== urlId) {
    seenUrl.current = urlId;
    if (urlId == null) {
      if (panel.type !== "draft") setPanel(createDraft());
    } else if (panel.type === "draft" && panel.id === urlId) {
      if (!panel.urlLive) setPanel({ ...panel, urlLive: true });
    } else if (!(panel.type === "saved" && panel.id === urlId)) {
      setPanel({ type: "saved", id: urlId });
    }
  }

  /** The id to highlight in the sidebar: only chats that have a URL. */
  const openChatId =
    panel.type === "saved" || panel.urlLive ? panel.id : undefined;

  /** Give the current draft its `/agent/<id>` URL (first message, or a saved call). */
  const publishDraft = useCallback(
    (id: string) => {
      setPanel((current) =>
        current.type === "draft" && current.id === id
          ? { ...current, urlLive: true }
          : current,
      );
      if (chatId !== id) router.replace(`/agent/${id}`, { scroll: false });
    },
    [chatId, router],
  );

  /** Open an existing chat, or the draft that is already open. */
  const openThread = useCallback(
    (threadId: string) => {
      if (panel.type === "draft" && panel.id === threadId) {
        publishDraft(threadId);
        return;
      }
      setPanel({ type: "saved", id: threadId });
      router.push(`/agent/${threadId}`, { scroll: false });
    },
    [panel, publishDraft, router],
  );

  /**
   * Start an empty chat on the plain `/agent` URL. If one is already open, do
   * nothing: a second draft would remount the empty chat and replay its intro.
   */
  const startNewChat = useCallback(() => {
    const alreadyNew =
      urlId == null && panel.type === "draft" && !panel.urlLive;
    if (alreadyNew) return;

    setPanel(createDraft());
    router.push("/agent", { scroll: false });
  }, [panel, router, urlId]);

  return { panel, openChatId, publishDraft, openThread, startNewChat };
}
