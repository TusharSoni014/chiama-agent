import { NextResponse } from "next/server";
import { mastra } from "@/mastra";
import { auth } from "@/lib/auth";

const DEFAULT_RESOURCE = "weather-chat";

export const GET = async () => {
  const session = await auth();
  const resourceId = session?.user?.id ?? DEFAULT_RESOURCE;

  try {
    const memory = await mastra.getAgentById("weather-agent").getMemory();
    if (!memory) {
      return NextResponse.json([]);
    }

    const result = await memory.listThreads({
      filter: { resourceId },
    });
    return NextResponse.json(result?.threads ?? []);
  } catch (error) {
    console.error("Failed to list chat threads:", error);
    return NextResponse.json([]);
  }
};

export const DELETE = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const threadId = searchParams.get("threadId");

  if (!threadId) {
    return NextResponse.json({ error: "Missing threadId" }, { status: 400 });
  }

  try {
    const memory = await mastra.getAgentById("weather-agent").getMemory();
    if (!memory) {
      return NextResponse.json({ error: "Memory unavailable" }, { status: 500 });
    }

    await memory.deleteThread(threadId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete chat thread:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
};
