import { createFileRoute } from "@tanstack/react-router";
import { ToolWorkspace } from "@/components/tool-workspace";

export const Route = createFileRoute("/_app/notes")({ component: NotesPage });

function NotesPage() {
  return (
    <div className="space-y-4 max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight">Meeting Notes Summarizer</h1>
      <ToolWorkspace
        kind="notes"
        defaultTitle={(i) => `Notes: ${i.title || "Meeting"}`}
        fields={[
          { name: "title", label: "Meeting title", placeholder: "e.g. Q3 planning sync" },
          { name: "attendees", label: "Attendees", placeholder: "Alice, Bob, Carol…" },
          { name: "notes", label: "Raw notes / transcript", placeholder: "Paste the full meeting notes here…", type: "textarea", rows: 12 },
        ]}
      />
    </div>
  );
}
