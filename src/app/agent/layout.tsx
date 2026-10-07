import type { Metadata } from "next";
import { AgentWorkspace } from "@/components/agent/agent-workspace";

export const metadata: Metadata = {
  title: "Agent | Chiama",
};

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return <AgentWorkspace>{children}</AgentWorkspace>;
}
