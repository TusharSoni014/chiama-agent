import type { WSContext } from "hono/ws";
import type {
  VoiceClientMessage,
  VoiceServerMessage,
} from "../src/lib/voice-protocol";
import type { ChatAgentId } from "../src/lib/chat-agents";
import { parseOpenAIKey } from "../src/lib/openai-key-storage";
import { createVoiceAgent, getVoiceGreeting } from "./voice-agent";

type Voice = Awaited<
  ReturnType<ReturnType<typeof createVoiceAgent>["getVoice"]>
>;

type RealtimeVoice = Voice & {
  sendEvent: (type: string, data?: Record<string, unknown>) => void;
};

function asRealtime(voice: Voice): RealtimeVoice {
  return voice as RealtimeVoice;
}

/** Per-connection handlers: browser audio -> OpenAI Realtime, and its audio/transcripts back. */
export function createVoiceHandler(agentId: ChatAgentId) {
  let voice: Voice | undefined;
  let socket: WSContext | undefined;
  let started = false;
  let closed = false;

  const hangUp = () => {
    if (closed) return;
    closed = true;
    voice?.close?.();
  };

  const send = (message: VoiceServerMessage) => {
    if (!closed && socket?.readyState === 1) socket.send(JSON.stringify(message));
  };

  /**
   * Opens the call. `userKey` is the caller's own OpenAI key from the `start`
   * message. It is used for this call only and is never stored or logged.
   */
  const startCall = async (userKey?: string) => {
    try {
      if (!userKey && !process.env.OPENAI_API_KEY) {
        throw new Error(
          "Add your OpenAI key in Settings, or set OPENAI_API_KEY in .env and restart `npm run dev:voice`.",
        );
      }

      // getVoice() hands the agent's instructions and tools to the voice.
      const instance = await createVoiceAgent(agentId, userKey).getVoice();
      voice = instance;

      instance.on("speaker", (stream: NodeJS.ReadableStream) => {
        stream.on("data", (chunk: Buffer) =>
          send({ type: "audio", data: chunk.toString("base64") }),
        );
      });

      // The speakers play into the microphone. Without this, that echo is
      // transcribed as the caller and the model answers it, so the call
      // scripts both sides by itself.
      let agentResponding = false;
      const clearCallerAudio = () =>
        asRealtime(instance).sendEvent("input_audio_buffer.clear");

      instance.on("response.created", () => {
        agentResponding = true;
        clearCallerAudio();
      });
      instance.on("response.done", () => {
        agentResponding = false;
        clearCallerAudio();
      });

      // Pieces of both sides' speech. `response_id` is the same for every piece of
      // one turn (the item id for the caller, the response id for the agent), which
      // lets the browser keep a turn on one line even when it is cut or reordered.
      instance.on("writing", (data) => {
        const { text, role, response_id } = data as typeof data & {
          response_id: string;
        };
        if (!text.trim() && text.includes("\n")) return;
        send({
          type: "transcript",
          id: response_id,
          role: role === "assistant" ? "assistant" : "user",
          text,
        });
      });

      // The caller started talking: stop playback and reserve their place in the
      // transcript, because their words are transcribed after the agent may already reply.
      // Speech detected during the agent's own turn is its echo, not the caller.
      instance.on("input_audio_buffer.speech_started", (data) => {
        if (agentResponding) {
          clearCallerAudio();
          return;
        }
        send({
          type: "interrupt",
          id: (data as { item_id?: string }).item_id,
        });
      });

      // OpenAI protocol errors arrive as `{ error: { message } }`.
      instance.on(
        "error",
        (error: { message?: string; error?: { message?: string } }) => {
          console.error("[voice] realtime error:", error);
          send({
            type: "error",
            message: error.error?.message ?? error.message ?? "Voice error",
          });
        },
      );

      await instance.connect();
      if (closed) return instance.close?.();

      // Don't let detected noise cancel the agent and invent a caller turn.
      instance.updateConfig({
        type: "realtime",
        audio: {
          input: {
            transcription: { model: "whisper-1" },
            turn_detection: {
              type: "server_vad",
              threshold: 0.7,
              prefix_padding_ms: 300,
              silence_duration_ms: 700,
              create_response: true,
              interrupt_response: false,
            },
          },
        },
      });

      send({ type: "ready" });
      // Say the greeting and stop. `speak()` tells the model to "repeat the
      // following text", which makes it keep going and role-play the caller.
      asRealtime(instance).sendEvent("response.create", {
        response: {
          instructions: `Say exactly the greeting below, then stop and wait for the caller. Do not invent, repeat, or role-play anything the caller says.\n\n${getVoiceGreeting(agentId)}`,
        },
      });
    } catch (error) {
      console.error("[voice] failed to start:", error);
      send({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Could not start the call.",
      });
      socket?.close(1011, "Could not start the call");
      hangUp();
    }
  };

  return {
    // The call itself begins when the browser's `start` message arrives.
    onOpen(_event: Event, ws: WSContext) {
      socket = ws;
    },

    async onMessage(event: MessageEvent) {
      if (closed || typeof event.data !== "string") return;

      try {
        const message = JSON.parse(event.data) as VoiceClientMessage;

        if (message.type === "start") {
          if (started) return;
          started = true;
          const key =
            typeof message.openaiKey === "string"
              ? parseOpenAIKey(message.openaiKey)
              : null;
          await startCall(key ?? undefined);
          return;
        }

        if (!voice || message.type !== "audio") return;

        const bytes = Buffer.from(message.data, "base64");
        // Copy so the Int16Array is always 2-byte aligned.
        const pcm = new Int16Array(
          bytes.buffer.slice(
            bytes.byteOffset,
            bytes.byteOffset + bytes.byteLength - (bytes.byteLength % 2),
          ),
        );
        await voice.send(pcm);
      } catch (error) {
        console.error("[voice] bad message from browser:", error);
      }
    },

    onClose: hangUp,
    onError: hangUp,
  };
}
