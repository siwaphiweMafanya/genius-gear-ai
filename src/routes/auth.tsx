import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({ component: AuthShell });

function AuthShell() {
  return (
    <AuthProvider>
      <AuthPage />
      <Toaster richColors position="top-right" />
    </AuthProvider>
  );
}

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const signIn = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) toast.error(error.message);
  };
  const signUp = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin + "/dashboard" },
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Account created — you're signed in.");
  };
  const google = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (result.error) {
      setBusy(false);
      toast.error((result.error as any).message || "Google sign-in failed");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-primary/15 via-background to-background border-r">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-md bg-primary text-primary-foreground grid place-items-center">
            <Sparkles className="size-5" />
          </div>
          <span className="font-semibold">AI Workplace</span>
        </div>
        <div className="space-y-4 max-w-md">
          <h1 className="text-3xl font-semibold tracking-tight">Your AI copilot for everyday work.</h1>
          <p className="text-muted-foreground">
            Draft emails, summarize meetings, plan tasks, research topics, and chat with an AI
            assistant — all in one workspace.
          </p>
          <ul className="text-sm text-muted-foreground space-y-1.5">
            <li>• Structured prompts, editable outputs</li>
            <li>• Personal library of saved drafts</li>
            <li>• Conversation history that follows you</li>
          </ul>
        </div>
        <p className="text-xs text-muted-foreground">© AI Workplace</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Sign in or create an account to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="space-y-4">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>
              {(["signin", "signup"] as const).map((mode) => (
                <TabsContent key={mode} value={mode} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor={`email-${mode}`}>Email</Label>
                    <Input id={`email-${mode}`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`pw-${mode}`}>Password</Label>
                    <Input id={`pw-${mode}`} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <Button className="w-full" disabled={busy} onClick={mode === "signin" ? signIn : signUp}>
                    {busy ? <Loader2 className="size-4 animate-spin" /> : mode === "signin" ? "Sign in" : "Create account"}
                  </Button>
                </TabsContent>
              ))}
            </Tabs>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" disabled={busy} onClick={google}>
              Continue with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
