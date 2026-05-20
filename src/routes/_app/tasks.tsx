import { createFileRoute } from "@tanstack/react-router";
import { ToolWorkspace } from "@/components/tool-workspace";

export const Route = createFileRoute("/_app/tasks")({ component: TasksPage });

function TasksPage() {
  return (
    <div className="space-y-4 max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight">AI Task Planner</h1>
      <ToolWorkspace
        kind="tasks"
        defaultTitle={(i) => `Plan: ${i.goal?.slice(0, 60) || "Untitled"}`}
        fields={[
          { name: "goal", label: "Goal", placeholder: "What do you want to accomplish?", type: "textarea", rows: 2 },
          { name: "deadline", label: "Deadline / horizon", placeholder: "e.g. 2 weeks, by Friday" },
          { name: "capacity", label: "Time available per day", placeholder: "e.g. 2 hours / day" },
          { name: "context", label: "Constraints / context", placeholder: "Team size, tools, blockers…", type: "textarea", rows: 3 },
        ]}
      />
    </div>
  );
}
