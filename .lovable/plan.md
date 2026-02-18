
# خطة ربط المنصة ببوابة الدفع PayPal

## نظرة عامة
سيتم إضافة خيار الدفع عبر PayPal بجانب طريقة الدفع اليدوية (Click) الحالية. الطالب سيختار طريقة الدفع عند شراء كورس مدفوع.

---

## المكونات الرئيسية

### 1. تخزين المفاتيح
- **PayPal Client ID**: سيُخزن في الكود كمتغير بيئة (مفتاح عام آمن للنشر)
- **PayPal Secret**: سيُخزن بشكل آمن في Lovable Cloud كـ secret ويُستخدم فقط من backend functions

### 2. Edge Function جديدة: `paypal-payment`
- إنشاء طلب دفع PayPal (Create Order)
- تأكيد الدفع بعد موافقة العميل (Capture Order)
- عند نجاح الدفع: تسجيل الشراء في جدول `purchases` وتسجيل الطالب في جدول `enrollments`

### 3. مكون جديد: `PaymentMethodSelector`
- نافذة اختيار طريقة الدفع (PayPal أو التحويل اليدوي)
- تظهر عند الضغط على زر الاشتراك في كورس مدفوع

### 4. مكون جديد: `PayPalPaymentModal`
- يعرض زر "ادفع عبر PayPal"
- يفتح نافذة PayPal للدفع
- يتعامل مع نتيجة الدفع (نجاح/فشل)

### 5. تعديل صفحة تفاصيل الكورس
- بدلا من فتح نافذة Click مباشرة، تفتح نافذة اختيار طريقة الدفع أولا

---

## التفاصيل التقنية

### الملفات الجديدة

| الملف | الوصف |
|-------|-------|
| `supabase/functions/paypal-payment/index.ts` | Edge function للتعامل مع PayPal API |
| `src/components/payment/PayPalPaymentModal.tsx` | نافذة الدفع عبر PayPal |
| `src/components/payment/PaymentMethodSelector.tsx` | نافذة اختيار طريقة الدفع |

### الملفات المعدلة

| الملف | التعديل |
|-------|---------|
| `src/pages/CourseDetails.tsx` | استبدال فتح ClickPaymentModal بـ PaymentMethodSelector |
| `src/i18n/locales/*.ts` | إضافة ترجمات PayPal (6 ملفات) |
| `supabase/config.toml` | إضافة إعدادات edge function الجديدة |

### تدفق الدفع عبر PayPal

```text
1. الطالب يضغط "اشترك الآن"
2. تظهر نافذة اختيار الطريقة (PayPal / تحويل يدوي)
3. يختار PayPal
4. يُرسل طلب إلى edge function لإنشاء Order
5. يُعاد توجيهه لصفحة PayPal للدفع
6. بعد الموافقة يُرسل طلب capture لتأكيد الدفع
7. عند النجاح: يُسجل في purchases + enrollments تلقائيا
```

### Edge Function: paypal-payment

```text
POST /paypal-payment
  body: { action: "create", courseId, amount }
  -> ينشئ PayPal Order ويعيد orderID

POST /paypal-payment
  body: { action: "capture", orderID, courseId }
  -> يؤكد الدفع ويسجل في قاعدة البيانات
```

### Secret المطلوب
- `PAYPAL_SECRET` - سيتم طلبه من المستخدم عبر أداة إضافة الأسرار
