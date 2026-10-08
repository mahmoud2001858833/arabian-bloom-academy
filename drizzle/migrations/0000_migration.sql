CREATE TABLE public.ad_advisor_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'محادثة جديدة',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.ad_advisor_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.ad_advisor_threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  message_id text NOT NULL,
  role text NOT NULL,
  parts jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (thread_id, message_id)
);
CREATE INDEX ON public.ad_advisor_messages (thread_id, created_at);
ALTER TABLE public.ad_advisor_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_advisor_messages ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ad_advisor_threads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ad_advisor_messages TO authenticated;
GRANT ALL ON public.ad_advisor_threads TO service_role;
GRANT ALL ON public.ad_advisor_messages TO service_role;
CREATE POLICY "Admins manage own advisor threads" ON public.ad_advisor_threads FOR ALL TO authenticated
  USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage own advisor messages" ON public.ad_advisor_messages FOR ALL TO authenticated
  USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));