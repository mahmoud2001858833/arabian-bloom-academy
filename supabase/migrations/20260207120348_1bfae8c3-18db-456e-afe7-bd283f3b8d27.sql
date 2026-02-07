-- إضافة حقل pdf_url لجدول الدروس
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS pdf_url text DEFAULT NULL;

-- إنشاء bucket لتخزين ملفات PDF
INSERT INTO storage.buckets (id, name, public)
VALUES ('lesson-pdfs', 'lesson-pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- سياسة لعرض ملفات PDF للجميع
CREATE POLICY "Anyone can view lesson PDFs" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'lesson-pdfs');

-- سياسة للأدمن لرفع ملفات PDF
CREATE POLICY "Admins can upload lesson PDFs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'lesson-pdfs' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- سياسة للأدمن لحذف ملفات PDF
CREATE POLICY "Admins can delete lesson PDFs" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'lesson-pdfs' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);