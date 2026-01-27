-- جدول إعدادات الدفع (معلومات حساب الكلك)
CREATE TABLE public.payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_method text NOT NULL DEFAULT 'click',
  account_name text NOT NULL,
  account_number text NOT NULL,
  instructions text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- جدول طلبات الدفع المعلقة
CREATE TABLE public.pending_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL,
  receipt_url text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid
);

-- تفعيل RLS
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_payments ENABLE ROW LEVEL SECURITY;

-- سياسات payment_settings
CREATE POLICY "Anyone can view active payment settings"
ON public.payment_settings FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage payment settings"
ON public.payment_settings FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- سياسات pending_payments
CREATE POLICY "Users can create payment requests"
ON public.pending_payments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own payment requests"
ON public.pending_payments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payment requests"
ON public.pending_payments FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update payment requests"
ON public.pending_payments FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- إنشاء bucket للوصولات
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- سياسة رفع الوصولات
CREATE POLICY "Users can upload receipts"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- سياسة عرض الوصولات
CREATE POLICY "Anyone can view receipts"
ON storage.objects FOR SELECT
USING (bucket_id = 'receipts');

-- trigger لتحديث updated_at
CREATE TRIGGER update_payment_settings_updated_at
BEFORE UPDATE ON public.payment_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();