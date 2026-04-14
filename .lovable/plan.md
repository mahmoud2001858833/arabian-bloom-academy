

# خطة تطوير شاملة للمنصة

هذه خطة تفصيلية لجميع الميزات المطلوبة. نظراً لكثرة التغييرات، سأقسمها إلى مراحل.

---

## المرحلة 1: لوحة معلومات احترافية للأدمن

### ما سيتم بناؤه:
- لوحة بيانات شاملة تعرض: عدد المستخدمين مع إيميل كل مستخدم، الإيرادات، التسجيلات، الكورسات النشطة
- تمثيل بياني احترافي باستخدام Recharts (مخططات بيانية للإيرادات الشهرية، التسجيلات، توزيع الطلاب)
- جدول المستخدمين المسجلين مع الإيميل والاسم وتاريخ التسجيل
- إعدادات متعددة: البريد الإلكتروني للمنصة (قابل للتعديل)

### التغييرات التقنية:
- إنشاء مكون `AdminDashboard.tsx` جديد بداخل مجلد admin
- استخدام `ChartContainer` و Recharts للمخططات البيانية
- جلب بيانات المستخدمين من `profiles` و `auth.users` (عبر edge function)
- حفظ البريد الإلكتروني للمنصة في جدول `site_settings`

---

## المرحلة 2: ترتيب الكورسات + اختيار العملة

### ما سيتم بناؤه:
- خيار ترتيب الكورسات (سحب وإفلات أو أسهم) لتحديد أي كورس يظهر أولاً للطلاب
- خيار اختيار العملة (دولار USD أو دينار JOD) عند إنشاء الكورس

### التغييرات التقنية:
- إضافة عمود `sort_order` و `currency` لجدول `courses` (migration)
- تعديل نموذج إنشاء الكورس في `Admin.tsx` لإضافة اختيار العملة
- تعديل `Courses.tsx` ليرتب حسب `sort_order`

---

## المرحلة 3: تحسين طلبات الدفع + فتح الكورس فوراً

### ما سيتم بناؤه:
- عرض جميع معلومات الطالب (الاسم، الإيميل، تاريخ التسجيل) مع طلب الدفع
- عند موافقة الأدمن، يفتح الكورس فوراً للطالب (هذا موجود فعلاً في `PaymentManagement` - سأتأكد من عمله بشكل صحيح)

### التغييرات التقنية:
- تعديل `PaymentManagement.tsx` لجلب وعرض الإيميل من `auth.users` عبر edge function
- التأكد من أن الموافقة تنشئ enrollment فوراً (موجود بالفعل)

---

## المرحلة 4: نظام العروض (Offers)

### ما سيتم بناؤه:
- تبويب جديد "العروض" في لوحة الأدمن
- زر "العروض" بجانب زر الفيديو التعريفي في الصفحة الرئيسية بلون ذهبي
- رفع: اسم العرض، وصف، صورة، فيديو (اختياري)
- صفحة عرض العروض للطلاب
- خط إعلانات (announcement bar) متحرك أحمر تحت الهيدر يمكن تفعيله/تعطيله من لوحة التحكم

### التغييرات التقنية:
- إنشاء جدول `offers` (id, title, description, image_url, video_url, is_active, created_at)
- إنشاء جدول أو إعداد في `site_settings` لخط الإعلانات (announcement_bar_text, announcement_bar_active)
- إنشاء صفحة `Offers.tsx` ومكون `AnnouncementBar.tsx`
- إضافة رابط في `Navbar.tsx` و `HeroSection.tsx`
- إنشاء bucket تخزين للصور

---

## المرحلة 5: نظام الكتب الرقمية (E-Books)

### ما سيتم بناؤه:
- تبويب "الكتب" في لوحة الأدمن لرفع كتاب PDF مع وصف ومعلومات وسعر
- خيار "الكتب" في الهيدر (Navbar)
- صفحة عرض الكتب للطلاب
- تنزيل PDF تلقائي بعد الدفع

### التغييرات التقنية:
- إنشاء جدول `books` (id, title, description, price, currency, pdf_url, cover_image_url, is_published, created_at)
- إنشاء جدول `book_purchases` (id, user_id, book_id, amount, status, created_at)
- إنشاء bucket `book-files` و `book-covers`
- صفحة `Books.tsx` و `BookDetails.tsx`
- مكون `BookManagement.tsx` في الأدمن
- RLS policies للوصول المحمي

---

## المرحلة 6: تغييرات UI متنوعة

### ما سيتم بناؤه:
1. **أيقونة الدعم الفني**: تغيير من أيقونة WhatsApp إلى أيقونة سماعة هاتف (Headphones) - هذا موجود فعلاً!
2. **بطاقات WhyUs**: إضافة لمسة بنفسجية وحيوية أكثر للبطاقات في الصفحة الرئيسية
3. **الامتحانات المربوطة بالدروس**: لا تظهر في صفحة الامتحانات العامة (فلترة الامتحانات المرتبطة بدروس)
4. **التقييمات المتعددة**: السماح للطالب بإضافة أكثر من تقييم (إزالة القيد الحالي unique constraint)

### التغييرات التقنية:
- تعديل `SupportChat.tsx` لتغيير الأيقونة إلى `Phone`/`Headphones`
- تعديل `WhyUs.tsx` لإضافة ألوان بنفسجية وتأثيرات حركية
- تعديل `Exams.tsx` لاستثناء الامتحانات المربوطة بدروس
- تعديل constraint في `reviews` للسماح بتقييمات متعددة + تعديل `Reviews.tsx`

---

## ملخص التغييرات التقنية

### جداول جديدة (Database Migrations):
- `offers` - العروض
- `books` - الكتب الرقمية
- `book_purchases` - مشتريات الكتب
- إضافة أعمدة `sort_order` و `currency` لـ `courses`
- إزالة unique constraint من `reviews`

### ملفات جديدة:
- `src/components/admin/AdminDashboard.tsx`
- `src/components/admin/OffersManagement.tsx`
- `src/components/admin/BookManagement.tsx`
- `src/components/home/AnnouncementBar.tsx`
- `src/pages/Offers.tsx`
- `src/pages/Books.tsx`
- `supabase/functions/get-users/index.ts` (لجلب بيانات المستخدمين)

### ملفات معدلة:
- `src/pages/Admin.tsx` - إضافة التبويبات الجديدة
- `src/pages/Index.tsx` - إضافة AnnouncementBar
- `src/components/layout/Navbar.tsx` - إضافة روابط الكتب والعروض
- `src/components/home/HeroSection.tsx` - زر العروض
- `src/components/home/WhyUs.tsx` - تحسين البطاقات
- `src/components/support/SupportChat.tsx` - تغيير الأيقونة
- `src/pages/Exams.tsx` - فلترة الامتحانات
- `src/pages/Reviews.tsx` - تقييمات متعددة
- `src/components/admin/PaymentManagement.tsx` - عرض معلومات الطالب

