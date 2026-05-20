
CREATE TABLE public.threads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'New conversation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "threads_owner_select" ON public.threads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "threads_owner_insert" ON public.threads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "threads_owner_update" ON public.threads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "threads_owner_delete" ON public.threads FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX threads_user_idx ON public.threads(user_id, updated_at DESC);

CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID NOT NULL REFERENCES public.threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages_owner_select" ON public.messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "messages_owner_insert" ON public.messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "messages_owner_delete" ON public.messages FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX messages_thread_idx ON public.messages(thread_id, created_at ASC);

CREATE TABLE public.saved_outputs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  kind TEXT NOT NULL,
  title TEXT,
  input JSONB NOT NULL DEFAULT '{}'::jsonb,
  output TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.saved_outputs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "outputs_owner_select" ON public.saved_outputs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "outputs_owner_insert" ON public.saved_outputs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "outputs_owner_update" ON public.saved_outputs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "outputs_owner_delete" ON public.saved_outputs FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX outputs_user_idx ON public.saved_outputs(user_id, kind, updated_at DESC);

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER threads_touch BEFORE UPDATE ON public.threads FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER outputs_touch BEFORE UPDATE ON public.saved_outputs FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
