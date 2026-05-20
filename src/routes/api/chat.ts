import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider, DEFAULT_MODEL, getLovableApiKey } from "@/lib/ai-gateway";

const SYSTEM = `You are the AI Workplace Productivity Assistant — a helpful, concise, professional copilot for working professionals. Answer in clear markdown. Help with email drafting, meeting summarization, planning, research, brainstorming, and general workplace tasks. When unsure, say so. Never fabricate data.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const { messages } = (await request.json()) as { messages: UIMessage[] };
          if (!Array.isArray(messages)) {
            return new Response("messages required", { status: 400 });
          }
          const gateway = createLovableAiGatewayProvider(getLovableApiKey());
          const result = streamText({
            model: gateway(DEFAULT_MODEL),
            system: SYSTEM,
            messages: await convertToModelMessages(messages),
          });
          return result.toUIMessageStreamResponse({ originalMessages: messages });
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
