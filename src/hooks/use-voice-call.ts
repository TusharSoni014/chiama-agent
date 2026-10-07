"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PcmPlayer, startMic } from "@/lib/call-audio";
import { useAgentStore } from "@/stores/agent-store";
import { getStoredOpenAIKey } from "@/lib/openai-key-storage";
import type {
  VoiceClientMessage,
  VoiceRole,
  VoiceServerMessage,
} from "@/lib/voice-protocol";

export type CallStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "listening"
  | "speaking"
  | "disconnected";

export interface TranscriptEntry {
  id: string;
  role: VoiceRole;
  text: string;
}

interface UseVoiceCallOptions {
  /** Conversation the finished call is saved into. */
  threadId: string;
  /** Called once the call's transcript has been added to that conversation. */
  onSaved?: () => void;
  /** When false (signed-out visitors) the transcript is never sent to the server. */
  persist?: boolean;
}

const VOICE_WS_URL = `${
  process.env.NEXT_PUBLIC_VOICE_WS_URL ?? "ws://localhost:3001"
}/ws/voice`;

function toBase64(buffer: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

/** Voice call with the agent: mic and speaker streamed over a WebSocket to server/. */
export function useVoiceCall({
  threadId,
  onSaved,
  persist = true,
}: UseVoiceCallOptions) {
  const [phase, setPhase] = useState<Exclude<CallStatus, "speaking">>("idle");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const hangUpRef = useRef<((message?: string) => void) | null>(null);
  const optionsRef = useRef({ threadId, onSaved, persist });
  useEffect(() => {
    optionsRef.current = { threadId, onSaved, persist };
  });

  const start = useCallback(async () => {
    if (hangUpRef.current) return;

    setPhase("connecting");
    setError(null);
    setTranscript([]);

    const { threadId: callThreadId } = optionsRef.current;
    // The agent's audio plays out of the speakers and back into the mic.
    // Forwarding that audio makes the model transcribe itself as the caller
    // and answer, so the call scripts the caller's side on its own.
    let agentSpeaking = false;
    let heardAgent = false;
    let callerMicOpen = false;
    const player = new PcmPlayer((speaking) => {
      agentSpeaking = speaking;
      if (!speaking && heardAgent) callerMicOpen = true;
      setIsSpeaking(speaking);
    });
    let socket: WebSocket | undefined;
    let stopMic: (() => void) | undefined;
    let live = false;
    let closed = false;
    // One line per spoken turn, kept in the order the turns started.
    let entries: TranscriptEntry[] = [];

    const saveTranscript = () => {
      const spoken = entries.filter((entry) => entry.text.trim());
      if (spoken.length === 0 || !optionsRef.current.persist) return;
      fetch("/api/chat/call-transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId: callThreadId,
          transcript: spoken.map(({ role, text }) => ({ role, text })),
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error(res.statusText);
          optionsRef.current.onSaved?.();
        })
        .catch(() =>
          setError("The call ended, but its transcript could not be saved to the chat.")
        );
    };

    const hangUp = (message?: string) => {
      if (closed) return;
      closed = true;
      socket?.close(); // closing the socket also ends the call on the server
      stopMic?.();
      player.close();
      hangUpRef.current = null;
      if (message) setError((current) => current ?? message);
      setIsSpeaking(false);
      setPhase("disconnected");
      saveTranscript();
    };
    hangUpRef.current = hangUp;

    // Appends to the line of turn `id`, creating it if this is the first piece.
    const addTranscript = (id: string, role: VoiceRole, text: string) => {
      entries = entries.some((entry) => entry.id === id)
        ? entries.map((entry) =>
            entry.id === id ? { ...entry, text: entry.text + text } : entry
          )
        : [...entries, { id, role, text }];
      setTranscript(entries.filter((entry) => entry.text.trim()));
    };

    try {
      const stop = await startMic((chunk) => {
        // Stay closed until the greeting has finished, and stay closed while
        // the agent is playing, so its voice is never sent back as the caller.
        if (!callerMicOpen || agentSpeaking) return;
        if (!live || socket?.readyState !== WebSocket.OPEN) return;
        const message: VoiceClientMessage = { type: "audio", data: toBase64(chunk) };
        socket.send(JSON.stringify(message));
      });
      if (closed) return stop();
      stopMic = stop;

      // Read the dropdown's current choice once, when the call begins.
      const { selectedAgentId } = useAgentStore.getState();
      socket = new WebSocket(
        `${VOICE_WS_URL}?agentId=${encodeURIComponent(selectedAgentId)}`
      );
      // The server waits for this before it opens the call.
      socket.onopen = () => {
        const openaiKey = getStoredOpenAIKey() ?? undefined;
        const start: VoiceClientMessage = { type: "start", openaiKey };
        socket?.send(JSON.stringify(start));
      };
      socket.onclose = () =>
        hangUp(
          live
            ? "Lost connection to the agent."
            : "Could not reach the voice server. Is it running?"
        );
      socket.onmessage = ({ data }) => {
        const event = JSON.parse(data as string) as VoiceServerMessage;

        switch (event.type) {
          case "ready":
            live = true;
            setPhase("connected");
            setTimeout(
              () => setPhase((p) => (p === "connected" ? "listening" : p)),
              700
            );
            break;
          case "transcript":
            addTranscript(event.id, event.role, event.text);
            break;
          case "audio":
            heardAgent = true;
            player.enqueue(event.data);
            break;
          case "interrupt":
            player.interrupt();
            // Reserve the caller's line now; their words are transcribed later.
            if (event.id) addTranscript(event.id, "user", "");
            break;
          case "error":
            setError(event.message);
            break;
        }
      };
    } catch (caught) {
      hangUp(
        caught instanceof DOMException && caught.name === "NotAllowedError"
          ? "Microphone access was blocked. Allow it in your browser and try again."
          : caught instanceof Error
            ? caught.message
            : "Could not start the call."
      );
    }
  }, []);

  const end = useCallback(() => hangUpRef.current?.(), []);

  // Leaving the call screen must never leave the microphone open.
  useEffect(() => () => hangUpRef.current?.(), []);

  const status: CallStatus =
    isSpeaking && (phase === "connected" || phase === "listening")
      ? "speaking"
      : phase;

  return {
    status,
    isActive: ["connecting", "connected", "listening"].includes(phase),
    transcript,
    error,
    start,
    end,
    dismissError: () => setError(null),
  };
}
