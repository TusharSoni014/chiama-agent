"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Call02Icon, CallEnd01Icon } from "@hugeicons/core-free-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import { Message, MessageContent } from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { Spinner } from "@/components/ui/spinner";
import { useVoiceCall, type CallStatus } from "@/hooks/use-voice-call";
import { ChatErrorAlert } from "../chat-error-alert";

const STATUS_LABEL: Record<CallStatus, string> = {
  idle: "Ready",
  connecting: "Connecting",
  connected: "Connected",
  listening: "Listening",
  speaking: "Speaking",
  disconnected: "Disconnected",
};

interface CallScreenProps {
  /** Conversation the call transcript is saved into when the call ends. */
  threadId: string;
  onTranscriptSaved: () => void;
}

/** Mount only while the call view is open: unmounting hangs up the call. */
export function CallScreen({ threadId, onTranscriptSaved }: CallScreenProps) {
  const { status, isActive, transcript, error, start, end, dismissError } =
    useVoiceCall({ threadId, onSaved: onTranscriptSaved });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 flex-col items-center gap-2 px-4 pt-8 pb-4">
        <Avatar className="size-16">
          <AvatarImage src="/chiama.png" alt="Chiama" />
          <AvatarFallback>C</AvatarFallback>
        </Avatar>
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
            title="Call problem"
            error={new Error(error)}
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
                  {transcript.map(({ id, role, text }) => (
                    <MessageScrollerItem key={id} messageId={id}>
                      <Message align={role === "user" ? "end" : "start"}>
                        <MessageContent>
                          <Bubble
                            variant={role === "user" ? "secondary" : "ghost"}
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
          <Button size="lg" variant="destructive" onClick={end}>
            <HugeiconsIcon icon={CallEnd01Icon} data-icon="inline-start" />
            {status === "connecting" ? "Cancel" : "End call"}
          </Button>
        ) : (
          <Button size="lg" onClick={start}>
            <HugeiconsIcon icon={Call02Icon} data-icon="inline-start" />
            {status === "disconnected" ? "Call again" : "Start call"}
          </Button>
        )}
      </div>
    </div>
  );
}
