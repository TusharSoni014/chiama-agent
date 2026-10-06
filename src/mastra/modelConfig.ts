import type { Agent } from "@mastra/core/agent";

type ModelConfig = NonNullable<ConstructorParameters<typeof Agent>[0]["model"]>;

export const lmStudioModel: ModelConfig = {
  providerId: "lmstudio",
  modelId: "google/gemma-4-e4b",
};
