import "dotenv/config";
import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { PostgresStore } from "@mastra/pg";
import {
  Observability,
  MastraStorageExporter,
  MastraPlatformExporter,
  SensitiveDataFilter,
} from "@mastra/observability";
import { weatherWorkflow } from "./workflows/weather-workflow";
import { weatherAgent } from "./agents/weather-agent";
import { assistantAgent } from "./agents/assistant-agent";
import { tusharSoniAgent } from "./agents/tusharsoni-agent";
import { weatherTool } from "./tools/weather-tool";
import { tusharsoniTool } from "./tools/tusharsoni-tool";

export const mastra = new Mastra({
  workflows: { weatherWorkflow },
  agents: { weatherAgent, assistantAgent, tusharSoniAgent },
  tools: { weatherTool, tusharsoniTool },
  storage: new PostgresStore({
    id: "mastra-storage",
    connectionString: process.env.DATABASE_URL!,
  }),
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
  observability: new Observability({
    configs: {
      default: {
        serviceName: "mastra",
        exporters: [
          new MastraStorageExporter(), // Persists observability events to Mastra Storage
          new MastraPlatformExporter(), // Sends observability events to Mastra Platform (if MASTRA_PLATFORM_ACCESS_TOKEN is set)
        ],
        spanOutputProcessors: [
          new SensitiveDataFilter(), // Redacts sensitive data like passwords, tokens, keys
        ],
      },
    },
  }),
});
