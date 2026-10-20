"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ChatPanel } from "@/hooks/use-chat-panel";
import { CallScreen } from "./call/call-screen";
import { ChatLoader } from "./chat-loader";
import type { AgentView } from "./types";

interface AgentStageProps {
  /** The route's page. It renders nothing, see `src/app/agent/page.tsx`. */
  children: ReactNode;
  view: AgentView;
  panel: ChatPanel;
  isSignedIn: boolean;
  /** Called when the first message of a new chat is sent. */
  onPublishDraft: (id: string) => void;
  /** Called once a finished call's transcript has been saved to the chat. */
  onCallSaved: () => void;
}

/** The main area: the chat, with the call screen fading in on top of it. */
export function AgentStage({
  children,
  view,
  panel,
  isSignedIn,
  onPublishDraft,
  onCallSaved,
}: AgentStageProps) {
  const reduceMotion = useReducedMotion();
  const fade = reduceMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: [0.23, 1, 0.32, 1] as const };

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden">
      {/* Stays mounted behind the call so an in-flight reply is not lost. */}
      <motion.div
        className="absolute inset-0 flex min-h-0 flex-col"
        animate={{ opacity: view === "chat" ? 1 : 0 }}
        transition={fade}
        style={{ pointerEvents: view === "chat" ? "auto" : "none" }}
        aria-hidden={view !== "chat"}
      >
        {children}
        <ChatLoader
          key={panel.id}
          chatId={panel.id}
          fresh={panel.type === "draft"}
          onFirstMessage={
            panel.type === "draft" ? () => onPublishDraft(panel.id) : undefined
          }
        />
      </motion.div>
      <AnimatePresence>
        {view === "call" && (
          <motion.div
            key="call"
            className="absolute inset-0 flex min-h-0 flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
          >
            <CallScreen
              threadId={panel.id}
              persist={isSignedIn}
              onTranscriptSaved={onCallSaved}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
