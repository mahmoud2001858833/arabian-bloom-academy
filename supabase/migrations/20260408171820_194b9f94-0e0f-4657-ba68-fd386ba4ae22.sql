
-- Add multilingual columns to courses table
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS title_fr TEXT,
  ADD COLUMN IF NOT EXISTS title_ms TEXT,
  ADD COLUMN IF NOT EXISTS title_ur TEXT,
  ADD COLUMN IF NOT EXISTS title_id TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS description_fr TEXT,
  ADD COLUMN IF NOT EXISTS description_ms TEXT,
  ADD COLUMN IF NOT EXISTS description_ur TEXT,
  ADD COLUMN IF NOT EXISTS description_id TEXT;

-- Add multilingual columns to lessons table
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS title_fr TEXT,
  ADD COLUMN IF NOT EXISTS title_ms TEXT,
  ADD COLUMN IF NOT EXISTS title_ur TEXT,
  ADD COLUMN IF NOT EXISTS title_id TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS description_fr TEXT,
  ADD COLUMN IF NOT EXISTS description_ms TEXT,
  ADD COLUMN IF NOT EXISTS description_ur TEXT,
  ADD COLUMN IF NOT EXISTS description_id TEXT;
