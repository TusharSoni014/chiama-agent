import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const TUSHAR_SONI_LLMS_URL = "https://www.tusharsoni.com/llms.txt";

export const tusharsoniTool = createTool({
  id: "get-tusharsoni-llms-txt",
  description:
    "Fetches and returns the raw text content from https://www.tusharsoni.com/llms.txt containing comprehensive information about Tushar Soni (Tushar Verma), including bio, work experience, projects, skills, and contact details.",
  inputSchema: z.object({
    url: z
      .string()
      .url()
      .optional()
      .default(TUSHAR_SONI_LLMS_URL)
      .describe(
        `URL to fetch raw text from. Defaults to ${TUSHAR_SONI_LLMS_URL}`,
      ),
  }),
  outputSchema: z.object({
    rawText: z.string().describe("The raw text content fetched from the URL"),
    text: z.string().describe("The raw text content fetched from the URL"),
    url: z.string().describe("The URL that was fetched"),
  }),
  execute: async (inputData) => {
    const targetUrl = inputData?.url || TUSHAR_SONI_LLMS_URL;
    const response = await fetch(targetUrl, {
      headers: {
        Accept: "text/plain, text/markdown, */*",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch ${targetUrl}: ${response.status} ${response.statusText}`,
      );
    }

    const rawText = await response.text();

    return {
      rawText,
      text: rawText,
      url: targetUrl,
    };
  },
});

export const tusharSoniTool = tusharsoniTool;
export default tusharsoniTool;
