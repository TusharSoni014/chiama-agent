import { Agent } from "@mastra/core/agent";
import type { MastraVoice } from "@mastra/core/voice";
import { OpenAIRealtimeVoice } from "@mastra/voice-openai-realtime";
import { mastra } from "../src/mastra";
import {
  weatherAgentInstructions,
  weatherAgentTools,
} from "../src/mastra/agents/weather-agent";
import { textModel } from "../src/mastra/modelConfig";

/**
 * A realtime voice is a stateful WebSocket, so every call gets its own agent
 * (and voice). It shares the weather agent's instructions and tools, so editing
 * `weather-agent.ts` changes text chat and calls together.
 *
 * During a call `gpt-realtime` does the thinking and speaking; `model` below is
 * only used if this agent is asked for a text reply.
 */
export function createVoiceAgent() {
  const voice = new OpenAIRealtimeVoice({
    model: "gpt-realtime",
    speaker: "alloy",
    apiKey: process.env.OPENAI_API_KEY,
  });

  return new Agent({
    id: "weather-voice-agent",
    name: "Weather Voice Agent",
    instructions: weatherAgentInstructions,
    model: textModel,
    tools: weatherAgentTools,
    // The package bundles its own copy of `MastraVoice`, so TypeScript sees a
    // different (but identical) class. The cast is safe.
    voice: voice as unknown as MastraVoice,
    mastra,
  });
}
