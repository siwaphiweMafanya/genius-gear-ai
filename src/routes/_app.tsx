import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_app")({
  component: AppLayoutWrapper,
});

function AppLayoutWrapper() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}

function Gate() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  return (
    <SidebarProvider>
      <div className="w-full flex flex-col min-h-screen">
        <div className="w-full bg-card/80 border-b border-border text-[12px] text-muted-foreground px-4 py-2 flex items-center justify-center gap-2">
          <span aria-hidden>⚠️</span>
          <span><strong className="text-foreground font-medium">Responsible AI:</strong> AI-generated content may require human review.</span>
        </div>
        <div className="flex flex-1 w-full">
          <AppSidebar />
          <SidebarInset>
            <header className="h-14 flex items-center gap-3 border-b border-border px-4 sticky top-0 bg-background/80 backdrop-blur z-10">
              <SidebarTrigger />
              <div className="text-sm text-muted-foreground">Workspace</div>
            </header>
            <main className="p-6">
              <Outlet />
            </main>
          </SidebarInset>
        </div>
      </div>
      <Toaster richColors position="top-right" />
    </SidebarProvider>
  );
}
