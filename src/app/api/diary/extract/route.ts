import { NextResponse } from "next/server";
import { mastra } from "@/mastra";
import { diaryEntrySchema } from "@/mastra/agents/diary-extractor-agent";
import {
  errorResponse,
  getErrorMessage,
  getUserKeyContext,
} from "@/lib/chat-server";

const MAX_ENTRIES = 500;
const MAX_TEXT_LENGTH = 4000;

function parseTranscript(value: unknown) {
  if (!Array.isArray(value) || value.length > MAX_ENTRIES) return null;

  const lines: string[] = [];
  for (const item of value) {
    const { role, text } = item ?? {};
    if (role !== "user" && role !== "assistant") return null;
    if (typeof text !== "string") return null;
    if (text.trim()) {
      lines.push(`${role}: ${text.trim().slice(0, MAX_TEXT_LENGTH)}`);
    }
  }
  return lines;
}

/** Turns a finished diary call into the values for the diary form. Nothing is stored. */
export async function POST(req: Request) {
  try {
    const { transcript } = await req.json();
    const lines = parseTranscript(transcript);

    if (!lines) return errorResponse("Invalid call transcript.", 400);
    if (lines.length === 0) {
      return NextResponse.json({ personName: "", duration: "", topics: "" });
    }

    const response = await mastra
      .getAgentById("diary-extractor-agent")
      .generate(`Transcript:\n${lines.join("\n")}`, {
        structuredOutput: { schema: diaryEntrySchema },
        ...getUserKeyContext(req),
      });

    return NextResponse.json(diaryEntrySchema.parse(response.object));
  } catch (error) {
    console.error("Diary extraction failed:", error);
    return errorResponse(
      getErrorMessage(error, "Could not fill the form from the call."),
      500
    );
  }
}
