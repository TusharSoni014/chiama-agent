import { Agent, ToolsInput } from "@mastra/core/agent";
import type { MastraVoice } from "@mastra/core/voice";
import { OpenAIRealtimeVoice } from "@mastra/voice-openai-realtime";
import { mastra } from "../src/mastra";
import type { ChatAgentId } from "../src/lib/chat-agents";
import { toFirstName } from "../src/lib/first-name";
import { buildDiaryAgentInstructions } from "../src/mastra/agents/diary-agent";
import { tusharSoniAgentInstructions } from "../src/mastra/agents/tusharsoni-agent";
import {
  weatherAgentInstructions,
  weatherAgentTools,
} from "../src/mastra/agents/weather-agent";
import { tusharSoniTool } from "../src/mastra/tools/tusharsoni-tool";
import { textModel } from "../src/mastra/modelConfig";

/**
 * What a call needs from each text agent: its personality (instructions), its
 * abilities (tools) and the first sentence it says. Reusing the text agents'
 * own instructions means editing an agent changes chat and calls together.
 */
const VOICE_PROFILES: Record<
  ChatAgentId,
  {
    name: string;
    instructions: (firstName?: string) => string;
    tools: ToolsInput;
    greeting: (firstName?: string) => string;
  }
> = {
  "weather-agent": {
    name: "Weather Voice Agent",
    instructions: () => weatherAgentInstructions,
    tools: weatherAgentTools,
    greeting: () =>
      "Hi, I'm your weather assistant. Which city would you like the weather for?",
  },
  "tusharsoni-agent": {
    name: "Tushar Soni Voice Agent",
    instructions: () => tusharSoniAgentInstructions,
    tools: { tusharSoniTool },
    greeting: () =>
      "Hey! I can tell you all about Tushar Soni. What do you want to know?",
  },
  "diary-agent": {
    name: "Diary Voice Agent",
    instructions: buildDiaryAgentInstructions,
    tools: {},
    greeting: (firstName) =>
      `Hello ${firstName ?? "friend"}! Who did you just meet?`,
  },
};

/** `firstName` is the signed-in caller's first name; omit it for signed-out callers. */
export function getVoiceGreeting(agentId: ChatAgentId, firstName?: string) {
  return VOICE_PROFILES[agentId].greeting(toFirstName(firstName));
}

/**
 * A realtime voice is a stateful WebSocket, so every call gets its own agent
 * (and voice). It borrows the chosen text agent's instructions and tools.
 *
 * During a call `gpt-realtime` does the thinking and speaking; `model` below is
 * only used if this agent is asked for a text reply.
 */
export function createVoiceAgent(
  agentId: ChatAgentId,
  apiKey?: string,
  firstName?: string,
) {
  const profile = VOICE_PROFILES[agentId];

  const voice = new OpenAIRealtimeVoice({
    model: "gpt-realtime",
    speaker: "alloy",
    // The caller's own key when they sent one, otherwise the server's.
    apiKey: apiKey || process.env.OPENAI_API_KEY,
  });

  return new Agent({
    id: `${agentId}-voice`,
    name: profile.name,
    instructions: profile.instructions(toFirstName(firstName)),
    model: textModel,
    tools: profile.tools,
    // The package bundles its own copy of `MastraVoice`, so TypeScript sees a
    // different (but identical) class. The cast is safe.
    voice: voice as unknown as MastraVoice,
    mastra,
  });
}
