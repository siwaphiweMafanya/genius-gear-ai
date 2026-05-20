import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export const createLovableAiGatewayProvider = (lovableApiKey: string) =>
  createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: {
      "Lovable-API-Key": lovableApiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });

export function getLovableApiKey(): string {
  const key =
    (typeof process !== "undefined" && process.env?.LOVABLE_API_KEY) ||
    (globalThis as any)?.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return key as string;
}

export const DEFAULT_MODEL = "google/gemini-3-flash-preview";
