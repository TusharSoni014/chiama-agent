"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Call02Icon, CallEnd01Icon } from "@hugeicons/core-free-icons";
import type { OrbState } from "thinking-orbs";
import { Badge } from "@/components/ui/badge";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import { Message, MessageContent } from "@/components/ui/message";
import { AgentOrb } from "../agent-orb";
import { UserAvatar } from "../user-avatar";
import {
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { Spinner } from "@/components/ui/spinner";
import { useVoiceCall, type CallStatus } from "@/hooks/use-voice-call";
import {
  getStoredOpenAIKey,
  isOpenAIUsageLimitError,
  USAGE_LIMIT_HELP,
} from "@/lib/openai-key-storage";
import { useAgentStore } from "@/stores/agent-store";
import { ChatErrorAlert } from "../chat-error-alert";

const STATUS_LABEL: Record<CallStatus, string> = {
  idle: "Ready",
  connecting: "Connecting",
  connected: "Connected",
  listening: "Listening",
  speaking: "Speaking",
  disconnected: "Disconnected",
};

const ORB_STATE: Record<CallStatus, OrbState> = {
  idle: "breathing",
  connecting: "connecting",
  connected: "listening",
  listening: "listening",
  speaking: "composing",
  disconnected: "breathing",
};

interface CallScreenProps {
  /** Conversation the call transcript is saved into when the call ends. */
  threadId: string;
  onTranscriptSaved: () => void;
  /** False for signed-out visitors: the call works but is never saved. */
  persist?: boolean;
}

/** Mount only while the call view is open: unmounting hangs up the call. */
export function CallScreen({
  threadId,
  onTranscriptSaved,
  persist = true,
}: CallScreenProps) {
  const { status, isActive, transcript, error, start, end, dismissError } =
    useVoiceCall({ threadId, onSaved: onTranscriptSaved, persist });
  const setSettingsOpen = useAgentStore((state) => state.setSettingsOpen);
  const askForKey =
    Boolean(error) &&
    !getStoredOpenAIKey() &&
    (error === USAGE_LIMIT_HELP || isOpenAIUsageLimitError(error ?? ""));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 flex-col items-center gap-2 px-4 pt-8 pb-4">
        <AgentOrb
          state={ORB_STATE[status]}
          size={64}
          label={STATUS_LABEL[status]}
        />
        <h2 className="text-base font-semibold tracking-tight">Chiama Agent</h2>
        <Badge
          variant={status === "listening" || status === "speaking" ? "default" : "secondary"}
          role="status"
        >
          {status === "connecting" && <Spinner data-icon="inline-start" />}
          {STATUS_LABEL[status]}
        </Badge>
      </div>

      {error && (
        <div className="mx-auto w-full max-w-2xl shrink-0 px-4 pb-3">
          <ChatErrorAlert
            title={askForKey ? "Usage limit reached" : "Call problem"}
            error={new Error(askForKey ? USAGE_LIMIT_HELP : error)}
            retryLabel={askForKey ? "Add OpenAI key" : undefined}
            onRetry={askForKey ? () => setSettingsOpen(true) : undefined}
            onDismiss={dismissError}
          />
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col border-t">
        {transcript.length === 0 ? (
          <p className="m-auto px-4 text-sm text-muted-foreground">
            The live transcript will appear here once you start talking.
          </p>
        ) : (
          <MessageScrollerProvider autoScroll>
            <MessageScroller>
              <MessageScrollerViewport>
                <MessageScrollerContent className="mx-auto w-full max-w-2xl px-4 py-4">
                  {transcript.map(({ id, role, text }, index) => (
                    <MessageScrollerItem key={id} messageId={id}>
                      <Message align={role === "user" ? "end" : "start"}>
                        {role === "user" ? (
                          <UserAvatar className="self-end" />
                        ) : (
                          <span className="flex size-8 shrink-0 items-center justify-center self-end">
                            <AgentOrb
                              state={
                                index === transcript.length - 1
                                  ? ORB_STATE[status]
                                  : "breathing"
                              }
                              size={32}
                              paused={index !== transcript.length - 1}
                              label={
                                index === transcript.length - 1
                                  ? undefined
                                  : "Agent"
                              }
                            />
                          </span>
                        )}
                        <MessageContent>
                          <Bubble
                            variant={role === "user" ? "secondary" : "muted"}
                            align={role === "user" ? "end" : "start"}
                          >
                            <BubbleContent className="whitespace-pre-wrap">
                              {text}
                            </BubbleContent>
                          </Bubble>
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>
                  ))}
                </MessageScrollerContent>
              </MessageScrollerViewport>
            </MessageScroller>
          </MessageScrollerProvider>
        )}
      </div>

      <div className="flex shrink-0 justify-center border-t px-4 py-4">
        {isActive ? (
          <Button
            size="lg"
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={() => {
              if (status !== "connecting") void new Audio("/call-end.mp3").play();
              end();
            }}
          >
            <HugeiconsIcon icon={CallEnd01Icon} data-icon="inline-start" />
            {status === "connecting" ? "Cancel" : "End call"}
          </Button>
        ) : (
          <Button
            size="lg"
            className="bg-green-600 text-white hover:bg-green-700"
            onClick={() => {
              void new Audio("/call-connect.mp3").play();
              start();
            }}
          >
            <HugeiconsIcon icon={Call02Icon} data-icon="inline-start" />
            {status === "disconnected" ? "Call again" : "Start call"}
          </Button>
        )}
      </div>
    </div>
  );
}
