import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_app/chat")({ component: ChatIndex });

function ChatIndex() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const ran = useRef(false);

  useEffect(() => {
    if (loading || !user || ran.current) return;
    ran.current = true;
    (async () => {
      const { data: threads } = await supabase
        .from("threads")
        .select("id")
        .order("updated_at", { ascending: false })
        .limit(1);
      if (threads && threads.length > 0) {
        navigate({ to: "/chat/$threadId", params: { threadId: threads[0].id } });
        return;
      }
      const { data: created, error } = await supabase
        .from("threads")
        .insert({ user_id: user.id, title: "New conversation" })
        .select("id")
        .single();
      if (created && !error) {
        navigate({ to: "/chat/$threadId", params: { threadId: created.id } });
      }
    })();
  }, [user, loading, navigate]);

  return (
    <div className="grid place-items-center py-20">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}
