
-- جدول الامتحانات
CREATE TABLE public.exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  duration_minutes integer DEFAULT 30,
  passing_score integer DEFAULT 70,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

-- سياسات RLS للامتحانات
CREATE POLICY "Anyone can view published exams" ON public.exams
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage exams" ON public.exams
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- جدول أسئلة الامتحانات
CREATE TABLE public.exam_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  question text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]',
  correct_answer integer NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;

-- سياسات RLS لأسئلة الامتحانات
CREATE POLICY "Users can view questions of published exams" ON public.exam_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.exams
      WHERE exams.id = exam_questions.exam_id AND exams.is_published = true
    )
  );

CREATE POLICY "Admins can manage exam questions" ON public.exam_questions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- جدول محاولات الامتحانات
CREATE TABLE public.exam_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  exam_id uuid REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  score integer NOT NULL,
  passed boolean NOT NULL,
  answers jsonb NOT NULL DEFAULT '[]',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz DEFAULT now()
);

ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;

-- سياسات RLS لمحاولات الامتحانات
CREATE POLICY "Users can create attempts" ON public.exam_attempts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own attempts" ON public.exam_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all attempts" ON public.exam_attempts
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
