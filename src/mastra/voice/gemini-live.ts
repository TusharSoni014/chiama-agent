import type { MastraVoice } from "@mastra/core/voice";
import { GeminiLiveVoice } from "@mastra/voice-google-gemini-live";

/**
 * Gemini Live model used for realtime voice. It is available with a Google AI
 * Studio API key (`GOOGLE_API_KEY`).
 *
 * `@mastra/voice-google-gemini-live` hard-codes its `GeminiVoiceModel` union and
 * does not list this model yet, although the Live API accepts it.
 */
export const GEMINI_LIVE_MODEL = "gemini-3.8-live";

// The package does not export `GeminiLiveVoiceConfig`, so derive it from the
// constructor (the direct-config member of its parameter union).
type GeminiLiveVoiceConfig = Extract<
  NonNullable<ConstructorParameters<typeof GeminiLiveVoice>[0]>,
  { apiKey?: string }
>;
type GeminiLiveModel = NonNullable<GeminiLiveVoiceConfig["model"]>;

type GeminiLiveVoiceOptions = {
  /** Prebuilt voice: Puck, Charon, Aoede, Fenrir, Kore, ... */
  speaker?: GeminiLiveVoiceConfig["speaker"];
  debug?: boolean;
};

/**
 * Creates the Gemini Live voice for an agent's `voice` option.
 *
 * Why the return type is `MastraVoice`: the voice package ships its own bundled
 * copy of Mastra's `MastraVoice` class, which has `private` members. TypeScript
 * treats those as nominally different from `@mastra/core`'s `MastraVoice`
 * ("Property '#private' is missing in type 'GeminiLiveVoice'"). Both copies are
 * structurally identical at runtime, so the agent works unchanged; the
 * conversion lives here once instead of in every agent.
 */
export function createGeminiLiveVoice({
  speaker = "Puck",
  debug = false,
}: GeminiLiveVoiceOptions = {}): MastraVoice {
  const voice = new GeminiLiveVoice({
    apiKey: process.env.GOOGLE_API_KEY,
    model: GEMINI_LIVE_MODEL as GeminiLiveModel,
    speaker,
    debug,
  });

  return voice as unknown as MastraVoice;
}
