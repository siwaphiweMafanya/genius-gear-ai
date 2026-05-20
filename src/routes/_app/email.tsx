import { createFileRoute } from "@tanstack/react-router";
import { ToolWorkspace } from "@/components/tool-workspace";

export const Route = createFileRoute("/_app/email")({ component: EmailPage });

function EmailPage() {
  return (
    <div className="space-y-4 max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight">Smart Email Generator</h1>
      <ToolWorkspace
        kind="email"
        defaultTitle={(i) => `Email: ${i.goal?.slice(0, 60) || "Untitled"}`}
        fields={[
          { name: "recipient", label: "Recipient & context", placeholder: "e.g. Client at Acme Corp, first outreach" },
          { name: "tone", label: "Tone", placeholder: "Professional, friendly, concise…" },
          { name: "goal", label: "Goal of the email", placeholder: "What outcome do you want?", type: "textarea", rows: 2 },
          { name: "points", label: "Key points to include", placeholder: "- Point 1\n- Point 2", type: "textarea", rows: 5 },
        ]}
      />
    </div>
  );
}
