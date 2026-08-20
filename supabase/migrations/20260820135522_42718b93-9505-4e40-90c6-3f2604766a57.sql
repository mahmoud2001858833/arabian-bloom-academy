CREATE TABLE public.lesson_subtitles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (lesson_id, language)
);

GRANT SELECT ON public.lesson_subtitles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_subtitles TO authenticated;
GRANT ALL ON public.lesson_subtitles TO service_role;

ALTER TABLE public.lesson_subtitles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view subtitles" ON public.lesson_subtitles FOR SELECT USING (true);
CREATE POLICY "Admins can manage subtitles" ON public.lesson_subtitles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_lesson_subtitles_updated_at BEFORE UPDATE ON public.lesson_subtitles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS subtitle_status TEXT NOT NULL DEFAULT 'none';
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS subtitle_error TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS subtitle_generated_at TIMESTAMPTZ;

CREATE INDEX idx_lesson_subtitles_lesson ON public.lesson_subtitles(lesson_id);