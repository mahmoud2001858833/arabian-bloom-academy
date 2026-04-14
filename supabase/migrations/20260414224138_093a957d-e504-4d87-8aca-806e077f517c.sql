
-- Add sort_order and currency to courses
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USD';

-- Create offers table
CREATE TABLE public.offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  video_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active offers" ON public.offers FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage offers" ON public.offers FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create books table
CREATE TABLE public.books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  pdf_url text,
  cover_image_url text,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published books" ON public.books FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage books" ON public.books FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create book_purchases table
CREATE TABLE public.book_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  book_id uuid REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.book_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own book purchases" ON public.book_purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create book purchases" ON public.book_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all book purchases" ON public.book_purchases FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage book purchases" ON public.book_purchases FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('offer-images', 'offer-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('book-covers', 'book-covers', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('book-files', 'book-files', false) ON CONFLICT (id) DO NOTHING;

-- Storage policies for offer-images
CREATE POLICY "Anyone can view offer images" ON storage.objects FOR SELECT USING (bucket_id = 'offer-images');
CREATE POLICY "Admins can upload offer images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'offer-images' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete offer images" ON storage.objects FOR DELETE USING (bucket_id = 'offer-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Storage policies for book-covers
CREATE POLICY "Anyone can view book covers" ON storage.objects FOR SELECT USING (bucket_id = 'book-covers');
CREATE POLICY "Admins can upload book covers" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'book-covers' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete book covers" ON storage.objects FOR DELETE USING (bucket_id = 'book-covers' AND has_role(auth.uid(), 'admin'::app_role));

-- Storage policies for book-files (private)
CREATE POLICY "Admins can manage book files" ON storage.objects FOR ALL USING (bucket_id = 'book-files' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Purchasers can download book files" ON storage.objects FOR SELECT USING (
  bucket_id = 'book-files' AND EXISTS (
    SELECT 1 FROM public.book_purchases bp
    JOIN public.books b ON b.id = bp.book_id
    WHERE bp.user_id = auth.uid() AND bp.status = 'completed' AND b.pdf_url = name
  )
);

-- Remove unique constraint on reviews if exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reviews_user_id_key') THEN
    ALTER TABLE public.reviews DROP CONSTRAINT reviews_user_id_key;
  END IF;
END $$;
