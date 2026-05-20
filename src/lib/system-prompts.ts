export type ToolKind = "email" | "notes" | "tasks" | "research";

export const TOOL_META: Record<
  ToolKind,
  { label: string; description: string; system: string; promptBuilder: (i: Record<string, string>) => string }
> = {
  email: {
    label: "Smart Email Generator",
    description: "Draft professional emails from a short brief.",
    system:
      "You are a professional communications assistant. Write clear, concise, friendly, and well-structured business emails. Always include a subject line, greeting, body, and sign-off. Match the requested tone exactly. Output ONLY the email — no preamble or explanations. Use markdown for structure.",
    promptBuilder: (i) =>
      `Recipient / context: ${i.recipient || "(unspecified)"}\nTone: ${i.tone || "Professional"}\nGoal of the email: ${i.goal || ""}\nKey points to include:\n${i.points || ""}\n\nDraft the email now.`,
  },
  notes: {
    label: "Meeting Notes Summarizer",
    description: "Summarize meeting transcripts or raw notes into structured minutes.",
    system:
      "You are an expert meeting analyst. Convert raw meeting notes or transcripts into clean markdown with these sections: ## Summary, ## Key Decisions, ## Action Items (table: Owner | Task | Due), ## Open Questions, ## Next Steps. Be faithful — do not invent facts. If a section is empty, write '_None_'.",
    promptBuilder: (i) =>
      `Meeting title: ${i.title || "Untitled meeting"}\nAttendees: ${i.attendees || "Not specified"}\n\nRaw notes / transcript:\n${i.notes || ""}`,
  },
  tasks: {
    label: "AI Task Planner",
    description: "Break a goal into a prioritized, time-boxed task plan.",
    system:
      "You are a senior project planner. Convert a goal into a pragmatic action plan in markdown. Use these sections: ## Objective, ## Milestones, ## Task Breakdown (table: # | Task | Priority | Estimate | Dependencies), ## Risks & Mitigations, ## Suggested Schedule. Be specific, concrete, and realistic.",
    promptBuilder: (i) =>
      `Goal: ${i.goal || ""}\nDeadline / horizon: ${i.deadline || "Flexible"}\nAvailable time per day: ${i.capacity || "Not specified"}\nConstraints / context: ${i.context || "None"}`,
  },
  research: {
    label: "AI Research Assistant",
    description: "Produce a structured research brief on any topic.",
    system:
      "You are a rigorous research analyst. Produce a structured markdown brief with: ## Executive Summary, ## Background, ## Key Findings (bulleted), ## Comparison / Analysis (table when relevant), ## Open Questions, ## Recommended Next Steps. Be balanced, cite reasoning, and clearly mark any uncertainty. Do not fabricate statistics or URLs.",
    promptBuilder: (i) =>
      `Topic: ${i.topic || ""}\nAudience: ${i.audience || "General professional"}\nDepth: ${i.depth || "Medium"}\nSpecific questions to answer:\n${i.questions || "(none)"}`,
  },
};
