import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";
import { createLovableAiGatewayProvider, DEFAULT_MODEL, getLovableApiKey } from "@/lib/ai-gateway";
import { TOOL_META, type ToolKind } from "@/lib/system-prompts";

type Body = { kind?: ToolKind; input?: Record<string, string> };

export const Route = createFileRoute("/api/generate")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const { kind, input = {} } = (await request.json()) as Body;
          if (!kind || !TOOL_META[kind]) {
            return new Response(JSON.stringify({ error: "Invalid 'kind'" }), {
              status: 400,
              headers: { "content-type": "application/json" },
            });
          }
          const meta = TOOL_META[kind];
          const gateway = createLovableAiGatewayProvider(getLovableApiKey());
          const { text } = await generateText({
            model: gateway(DEFAULT_MODEL),
            system: meta.system,
            prompt: meta.promptBuilder(input),
          });
          return new Response(JSON.stringify({ text }), {
            headers: { "content-type": "application/json" },
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          const status = /429/.test(msg) ? 429 : /402/.test(msg) ? 402 : 500;
          return new Response(JSON.stringify({ error: msg }), {
            status,
            headers: { "content-type": "application/json" },
          });
        }
      },
    },
  },
});
