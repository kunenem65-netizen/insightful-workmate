import { createOpenAI } from "@ai-sdk/openai";

/**
 * Creates a Lovable AI Gateway provider configured for the Responses API.
 * Must only ever be called inside a server function handler.
 */
export function createGateway() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Missing LOVABLE_API_KEY");

  return createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey: key,
    headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });
}

export const MODEL_ID = "openai/gpt-6-astra";

export const REASONING_OPTIONS = {
  openai: {
    forceReasoning: true,
    reasoningEffort: "low",
    store: false,
  },
} as const;
