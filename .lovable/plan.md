

# خطة التطوير: قسم الامتحانات الإلكترونية + تعليم صعوبات القراءة

## ملخص
سنضيف قسم جديد للامتحانات الإلكترونية المستقلة (غير المرتبطة بالدروس) مع نظام إدارة متكامل في لوحة الأدمن، بالإضافة لتحديث وصف المنصة ليشمل تعليم صعوبات القراءة.

---

## المهام

### 1. إنشاء جداول قاعدة البيانات للامتحانات المستقلة

جدول `exams` لتخزين الامتحانات:
- id, title, description, duration_minutes, passing_score, is_published, created_at

جدول `exam_questions` لأسئلة الامتحان:
- id, exam_id, question, options (jsonb), correct_answer, order_index

جدول `exam_attempts` لمحاولات الطلاب:
- id, user_id, exam_id, score, passed, answers (jsonb), started_at, completed_at

مع سياسات RLS مناسبة (الأدمن يدير كل شيء، المستخدمون يرون الامتحانات المنشورة ويسجلون محاولاتهم).

### 2. صفحة الامتحانات للطلاب (`/exams`)

- صفحة عرض قائمة الامتحانات المتاحة مع بحث وتصفية
- صفحة تقديم الامتحان (`/exams/:examId`) مع مؤقت زمني
- عرض النتيجة بعد الانتهاء (نجاح/رسوب مع النسبة)
- يتطلب تسجيل الدخول لتقديم الامتحان

### 3. نظام إدارة الامتحانات في لوحة الأدمن

- تبويب جديد "الامتحانات" في لوحة التحكم
- إنشاء/تعديل/حذف امتحانات
- إضافة أسئلة متعددة الخيارات (4 خيارات) مع تحديد الإجابة الصحيحة
- تحديد مدة الامتحان ونسبة النجاح
- نشر/إلغاء نشر الامتحان
- عرض نتائج الطلاب ومحاولاتهم

### 4. إضافة رابط الامتحانات في التنقل

- إضافة رابط "الامتحانات" في شريط التنقل (Navbar) بجانب الدروس والمدونة

### 5. تحديث وصف المنصة لصعوبات القراءة

- تحديث النصوص في HeroSection و About و الترجمات لتشمل أن المنصة متخصصة في تعليم صعوبات القراءة
- تحديث الوصف الرئيسي والشعارات

### 6. تحديث الترجمات

- إضافة مفاتيح الترجمة الجديدة لجميع اللغات الست (ar, en, fr, ms, ur, id) لقسم الامتحانات وصعوبات القراءة

---

## التفاصيل التقنية

### قاعدة البيانات (Migration)
```sql
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
```

### الملفات الجديدة
- `src/pages/Exams.tsx` - صفحة عرض الامتحانات
- `src/pages/ExamTake.tsx` - صفحة تقديم الامتحان مع المؤقت
- `src/components/admin/ExamManagement.tsx` - مكون إدارة الامتحانات في الأدمن

### الملفات المعدلة
- `src/App.tsx` - إضافة المسارات الجديدة
- `src/components/layout/Navbar.tsx` - إضافة رابط الامتحانات
- `src/pages/Admin.tsx` - إضافة تبويب الامتحانات
- `src/components/home/HeroSection.tsx` - تحديث الوصف
- `src/i18n/locales/*.ts` - إضافة الترجمات (6 ملفات)

