

# خطة بناء نظام رفع وتشغيل الفيديوهات مع Cloudflare Worker

## نظرة عامة

سيتم إنشاء نظام متكامل لرفع الفيديوهات مباشرة إلى Cloudflare R2 عبر Worker، مع دعم الرفع المجزأ (Multipart Upload) وتشغيل الفيديوهات مع Range support.

## المكونات المطلوب إنشاؤها

### 1. Hooks للتعامل مع الفيديوهات

**ملف جديد: `src/hooks/useCloudflareVideoUrl.ts`**
- استخدام الرابط الجديد: `https://empty-art-c37e.mdfmmdfds.workers.dev`
- توليد روابط تشغيل الفيديو

**ملف جديد: `src/hooks/useR2VideoUrl.ts`**
- استخدام نفس الرابط للـ Worker
- التعامل مع طلبات الفيديو من R2

### 2. مكون رفع الفيديوهات

**ملف جديد: `src/components/dashboard/DualVideoUploader.tsx`**

الميزات:
- **حجم الأجزاء**: 10 ميجابايت لكل جزء
  ```typescript
  const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB per chunk
  ```
- **شريط تقدم دقيق**: يعرض نسبة الرفع لكل جزء
- **معالجة الأخطاء**: إعادة المحاولة تلقائياً (3 محاولات)
- **إلغاء الرفع**: زر لإلغاء العملية في أي وقت
- **Drag & Drop**: دعم السحب والإفلات

### 3. Edge Function للتكامل مع الـ Worker

**ملف جديد: `supabase/functions/upload-video-cloudflare/index.ts`**

```text
+---------------------+
|   Frontend          |
|  (DualVideoUploader)|
+----------+----------+
           |
           v
+----------+----------+
|   Edge Function     |
| (upload-video-      |
|   cloudflare)       |
+----------+----------+
           |
           v
+----------+----------+
| Cloudflare Worker   |
| (empty-art-c37e)    |
+----------+----------+
           |
           v
+----------+----------+
|   Cloudflare R2     |
|   (Video Storage)   |
+---------------------+
```

### 4. تحديث لوحة إدارة الدروس

**تعديل: `src/pages/Admin.tsx`**
- استبدال حقل إدخال رابط الفيديو بمكون `DualVideoUploader`
- عرض الفيديو المرفوع مباشرة

## تفاصيل الـ Endpoints

| Endpoint | الوظيفة |
|----------|---------|
| `POST /upload/start` | بدء عملية رفع جديدة (إرجاع uploadId) |
| `PUT /upload/part?uploadId=X&key=Y&partNumber=N` | رفع جزء من الفيديو |
| `POST /upload/complete` | إكمال الرفع وتجميع الأجزاء |
| `GET /video/{key}` | تشغيل الفيديو مع Range support |

## تدفق عملية الرفع

```text
1. اختيار الفيديو
        |
        v
2. POST /upload/start
   -> الحصول على uploadId و key
        |
        v
3. تقسيم الفيديو إلى أجزاء (10MB)
        |
        v
4. لكل جزء:
   PUT /upload/part
   -> تحديث شريط التقدم
        |
        v
5. POST /upload/complete
   -> تجميع الأجزاء
        |
        v
6. حفظ الرابط في قاعدة البيانات
```

## الملفات التي سيتم إنشاؤها/تعديلها

| الملف | النوع | الوصف |
|-------|-------|-------|
| `src/hooks/useCloudflareVideoUrl.ts` | جديد | Hook لتوليد روابط الفيديو |
| `src/hooks/useR2VideoUrl.ts` | جديد | Hook للتعامل مع R2 |
| `src/components/dashboard/DualVideoUploader.tsx` | جديد | مكون رفع الفيديوهات |
| `src/components/dashboard/VideoPlayer.tsx` | جديد | مكون تشغيل الفيديو |
| `supabase/functions/upload-video-cloudflare/index.ts` | جديد | Edge Function للرفع |
| `src/pages/Admin.tsx` | تعديل | دمج مكون الرفع |

## تفاصيل فنية

### معالجة الأخطاء وإعادة المحاولة
```typescript
const uploadWithRetry = async (chunk, partNumber, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await uploadPart(chunk, partNumber);
      return response;
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await delay(1000 * attempt); // Exponential backoff
    }
  }
};
```

### دعم إلغاء الرفع
```typescript
const abortController = new AbortController();
// عند الإلغاء
abortController.abort();
```

### شريط التقدم
- حساب النسبة بناءً على عدد الأجزاء المرفوعة
- تحديث في الوقت الفعلي لكل جزء

## ملاحظات مهمة

1. **الـ Worker الجديد**: `https://empty-art-c37e.mdfmmdfds.workers.dev`
2. **حجم الأجزاء**: 10MB بدلاً من 20MB
3. **التوافق**: يجب أن يدعم الـ Worker الـ CORS headers المناسبة
4. **الأمان**: استخدام Edge Function كوسيط للحماية

