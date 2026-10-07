/**
 * Agents the chat UI can talk to. Kept free of server imports so client
 * components can use it. Each `id` must match the agent's `id` registered in
 * `src/mastra/index.ts`.
 */
export const CHAT_AGENTS = [
  {
    id: "weather-agent",
    name: "Weather Agent",
    description: "Forecasts and activity planning",
  },
  {
    id: "tusharsoni-agent",
    name: "Tushar Soni Agent",
    description: "Ask about Tushar Soni",
  },
] as const;

export type ChatAgentId = (typeof CHAT_AGENTS)[number]["id"];

export const DEFAULT_CHAT_AGENT_ID: ChatAgentId = "weather-agent";

export function isChatAgentId(value: unknown): value is ChatAgentId {
  return CHAT_AGENTS.some((agent) => agent.id === value);
}
