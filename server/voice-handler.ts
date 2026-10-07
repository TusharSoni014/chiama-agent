import type { WSContext } from "hono/ws";
import type {
  VoiceClientMessage,
  VoiceServerMessage,
} from "../src/lib/voice-protocol";
import type { ChatAgentId } from "../src/lib/chat-agents";
import { createVoiceAgent, getVoiceGreeting } from "./voice-agent";

type Voice = Awaited<ReturnType<ReturnType<typeof createVoiceAgent>["getVoice"]>>;

/** Per-connection handlers: browser audio -> OpenAI Realtime, and its audio/transcripts back. */
export function createVoiceHandler(agentId: ChatAgentId) {
  let voice: Voice | undefined;
  let closed = false;

  const hangUp = () => {
    if (closed) return;
    closed = true;
    voice?.close?.();
  };

  return {
    async onOpen(_event: Event, ws: WSContext) {
      const send = (message: VoiceServerMessage) => {
        if (!closed && ws.readyState === 1) ws.send(JSON.stringify(message));
      };

      try {
        if (!process.env.OPENAI_API_KEY) {
          throw new Error(
            "OPENAI_API_KEY is missing. Add it to .env and restart `npm run dev:voice`."
          );
        }

        // getVoice() hands the agent's instructions and tools to the voice.
        const instance = await createVoiceAgent(agentId).getVoice();
        voice = instance;

        instance.on("speaker", (stream: NodeJS.ReadableStream) => {
          stream.on("data", (chunk: Buffer) =>
            send({ type: "audio", data: chunk.toString("base64") })
          );
        });

        // Pieces of both sides' speech. `response_id` is the same for every piece of
        // one turn (the item id for the caller, the response id for the agent), which
        // lets the browser keep a turn on one line even when it is cut or reordered.
        instance.on("writing", (data) => {
          // The typed event only lists text and role; OpenAI also sends the turn id.
          const { text, role, response_id } = data as typeof data & {
            response_id: string;
          };
          // A lone "\n" only marks the end of a turn.
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
        instance.on("input_audio_buffer.speech_started", (data) =>
          send({ type: "interrupt", id: (data as { item_id?: string }).item_id })
        );

        // OpenAI protocol errors arrive as `{ error: { message } }`.
        instance.on(
          "error",
          (error: { message?: string; error?: { message?: string } }) => {
            console.error("[voice] realtime error:", error);
            send({
              type: "error",
              message: error.error?.message ?? error.message ?? "Voice error",
            });
          }
        );

        await instance.connect();
        if (closed) return instance.close?.();

        send({ type: "ready" });
        await instance.speak(getVoiceGreeting(agentId));
      } catch (error) {
        console.error("[voice] failed to start:", error);
        send({
          type: "error",
          message:
            error instanceof Error ? error.message : "Could not start the call.",
        });
        ws.close(1011, "Could not start the call");
        hangUp();
      }
    },

    async onMessage(event: MessageEvent) {
      if (!voice || closed || typeof event.data !== "string") return;

      try {
        const message = JSON.parse(event.data) as VoiceClientMessage;
        if (message.type !== "audio") return;

        const bytes = Buffer.from(message.data, "base64");
        // Copy so the Int16Array is always 2-byte aligned.
        const pcm = new Int16Array(
          bytes.buffer.slice(
            bytes.byteOffset,
            bytes.byteOffset + bytes.byteLength - (bytes.byteLength % 2)
          )
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
