import { createFileRoute } from "@tanstack/react-router";
import { ToolWorkspace } from "@/components/tool-workspace";

export const Route = createFileRoute("/_app/research")({ component: ResearchPage });

function ResearchPage() {
  return (
    <div className="space-y-4 max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight">AI Research Assistant</h1>
      <ToolWorkspace
        kind="research"
        defaultTitle={(i) => `Research: ${i.topic?.slice(0, 60) || "Untitled"}`}
        fields={[
          { name: "topic", label: "Topic", placeholder: "What should we research?", type: "textarea", rows: 2 },
          { name: "audience", label: "Audience", placeholder: "Who is this for?" },
          { name: "depth", label: "Depth", placeholder: "Quick overview / Medium / Deep dive" },
          { name: "questions", label: "Specific questions to answer", placeholder: "- Question 1\n- Question 2", type: "textarea", rows: 5 },
        ]}
      />
    </div>
  );
}
