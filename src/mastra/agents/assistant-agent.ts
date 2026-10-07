import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { textModel } from "../modelConfig";

export const assistantAgentInstructions = `You are a helpful  assistant that helps the user in their tasks, confusions or just brainstortming.

You always,
- Reply in short, concise and human-like manner
- have a chill tone with fun vibe
- Avoid repeating yourself
- dont use emojis
- dont deviate from the topic unless asked by the user.
`;

export const assistantAgent = new Agent({
  id: "assistant-agent",
  name: "Assistant Agent",
  instructions: assistantAgentInstructions,
  model: textModel,
  memory: new Memory(),
});
