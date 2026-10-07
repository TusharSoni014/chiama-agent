import type { MastraDBMessage } from "@mastra/core/agent/message-list";
import { NextResponse } from "next/server";
import { toChatTitle } from "@/lib/chat-title";
import {
  errorResponse,
  getChatMemory,
  getChatResourceId,
  getErrorMessage,
} from "@/lib/chat-server";

const MAX_ENTRIES = 500;

interface CallEntry {
  role: "user" | "assistant";
  text: string;
}

function parseTranscript(value: unknown): CallEntry[] | null {
  if (!Array.isArray(value) || value.length > MAX_ENTRIES) return null;

  const entries: CallEntry[] = [];
  for (const item of value) {
    const { role, text } = item ?? {};
    if (role !== "user" && role !== "assistant") return null;
    if (typeof text !== "string") return null;
    if (text.trim()) entries.push({ role, text: text.trim() });
  }
  return entries;
}

/** Adds a finished voice call to a chat thread so it shows up in the conversation. */
export async function POST(req: Request) {
  try {
    const { threadId, transcript } = await req.json();
    const entries = parseTranscript(transcript);

    if (typeof threadId !== "string" || !threadId || !entries) {
      return errorResponse("Invalid call transcript.", 400);
    }
    if (entries.length === 0) return NextResponse.json({ saved: 0 });

    // Anonymous calls are never saved.
    const resourceId = await getChatResourceId();
    if (!resourceId) return NextResponse.json({ saved: 0 });

    const memory = await getChatMemory();
    if (!memory) return errorResponse("Chat memory is not configured.", 500);

    const existing = await memory.getThreadById({ threadId });

    if (existing && existing.resourceId !== resourceId) {
      return errorResponse("This conversation belongs to a different account.", 403);
    }
    if (!existing) {
      const firstUser = entries.find((entry) => entry.role === "user");
      await memory.createThread({
        threadId,
        resourceId,
        title: toChatTitle(firstUser?.text ?? "Voice call"),
      });
    }

    // Distinct timestamps keep the turns in spoken order.
    const now = Date.now();
    const messages: MastraDBMessage[] = entries.map(({ role, text }, index) => ({
      id: crypto.randomUUID(),
      role,
      createdAt: new Date(now + index),
      threadId,
      resourceId,
      content: {
        format: 2,
        parts: [{ type: "text", text }],
        metadata: { source: "voice-call" },
      },
    }));

    await memory.saveMessages({ messages });
    return NextResponse.json({ saved: messages.length });
  } catch (error) {
    console.error("Saving call transcript failed:", error);
    return errorResponse(
      getErrorMessage(error, "Could not save the call transcript."),
      500
    );
  }
}
