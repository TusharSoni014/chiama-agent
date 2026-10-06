import { NextResponse } from "next/server";
import { getChatMemory, getChatResourceId } from "@/lib/chat-server";

export const GET = async () => {
  try {
    const resourceId = await getChatResourceId();
    const memory = await getChatMemory();
    if (!memory) {
      return NextResponse.json([]);
    }

    const result = await memory.listThreads({
      filter: { resourceId },
      orderBy: { field: "updatedAt", direction: "DESC" },
      perPage: 100,
    });
    return NextResponse.json(result?.threads ?? []);
  } catch (error) {
    console.error("Failed to list chat threads:", error);
    return NextResponse.json(
      { error: "Could not load your conversations." },
      { status: 500 }
    );
  }
};

export const DELETE = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const threadId = searchParams.get("threadId");

  if (!threadId) {
    return NextResponse.json({ error: "Missing threadId" }, { status: 400 });
  }

  try {
    const resourceId = await getChatResourceId();
    const memory = await getChatMemory();
    if (!memory) {
      return NextResponse.json({ error: "Memory unavailable" }, { status: 500 });
    }

    const thread = await memory.getThreadById({ threadId });
    if (!thread) {
      return NextResponse.json({ success: true });
    }
    if (thread.resourceId !== resourceId) {
      return NextResponse.json(
        { error: "You cannot delete this conversation." },
        { status: 403 }
      );
    }

    await memory.deleteThread(threadId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete chat thread:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
};
