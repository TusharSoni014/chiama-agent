import { redirect } from "next/navigation";

// A new id on every visit, so this must never be prerendered at build time.
export const dynamic = "force-dynamic";

/** `/agent` always starts a new chat: every chat lives at `/agent/<chat id>`. */
export default function AgentPage() {
  redirect(`/agent/${crypto.randomUUID()}`);
}
