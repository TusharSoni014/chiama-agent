/** WebSocket messages between the browser and the voice server (server/). */

/** OpenAI Realtime uses 24 kHz mono PCM16 in both directions. */
export const VOICE_SAMPLE_RATE = 24_000;

export type VoiceRole = "user" | "assistant";

/**
 * Browser -> server. `start` is sent first and begins the call; `openaiKey` is the
 * visitor's own key (sent in the message, not the URL, and never stored).
 * `userName` is the signed-in visitor's first name, used only for the greeting;
 * it is absent for signed-out visitors. `data` in `audio` is base64 PCM16.
 */
export type VoiceClientMessage =
  | { type: "start"; openaiKey?: string; userName?: string }
  | { type: "audio"; data: string };

/** Server -> browser. */
export type VoiceServerMessage =
  | { type: "ready" }
  /** The agent finished the call (it said goodbye): hang up once its audio has played. */
  | { type: "end" }
  | { type: "audio"; data: string }
  /** A piece of one spoken turn. `id` is the same for every piece of that turn. */
  | { type: "transcript"; id: string; role: VoiceRole; text: string }
  /** The caller started talking (`id` is their turn): stop playback, reserve their line. */
  | { type: "interrupt"; id?: string }
  | { type: "error"; message: string };
