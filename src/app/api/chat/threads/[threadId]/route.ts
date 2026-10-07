import { NextResponse } from "next/server";
import { openChat } from "@/lib/chat-server";

/** Saved messages of one chat. 404 when it belongs to someone else. */
export const GET = async (
  _req: Request,
  { params }: { params: Promise<{ threadId: string }> },
) => {
  const { threadId } = await params;

  try {
    const { allowed, messages } = await openChat(threadId);
    if (!allowed) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Failed to load chat:", error);
    return NextResponse.json(
      { error: "Could not load this chat." },
      { status: 500 },
    );
  }
};
