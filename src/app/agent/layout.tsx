import type { Metadata } from "next";
import { AgentWorkspace } from "@/components/agent/agent-workspace";

export const metadata: Metadata = {
  title: "Agent | Chiama",
};

/** Holds the whole agent UI for both `/agent` and `/agent/<id>`, so it never remounts between them. */
export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return <AgentWorkspace>{children}</AgentWorkspace>;
}
