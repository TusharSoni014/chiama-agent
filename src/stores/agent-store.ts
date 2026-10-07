import { create } from "zustand";
import { DEFAULT_CHAT_AGENT_ID, type ChatAgentId } from "@/lib/chat-agents";

interface AgentStore {
  /** Agent that answers the next chat message. */
  selectedAgentId: ChatAgentId;
  setSelectedAgentId: (agentId: ChatAgentId) => void;
}

export const useAgentStore = create<AgentStore>((set) => ({
  selectedAgentId: DEFAULT_CHAT_AGENT_ID,
  setSelectedAgentId: (selectedAgentId) => set({ selectedAgentId }),
}));
