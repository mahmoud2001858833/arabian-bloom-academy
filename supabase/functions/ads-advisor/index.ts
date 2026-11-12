import { createClient } from "npm:@supabase/supabase-js@2";
import { createGoogleGenerativeAI } from "npm:@ai-sdk/google";
import { convertToModelMessages, streamText, type UIMessage } from "npm:ai@7";
import { z } from "npm:zod@3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const BodySchema = z.object({
  threadId: z.string().uuid(),
  messages: z.array(z.any()).min(1),
});

const pick = (row: Record<string, any>, keys: string[]) =>
  Object.fromEntries(keys.filter((k) => row[k] !== undefined && row[k] !== null && row[k] !== "").map((k) => [k, row[k]]));

async function buildPlatformSnapshot(admin: ReturnType<typeof createClient>) {
  const safe = async (q: PromiseLike<{ data: any; error: any; count?: number | null }>) => {
    const r = await q;
    return r.error ? { data: [], count: 0 } : { data: r.data ?? [], count: r.count ?? 0 };
  };
  const [courses, lessons, books, offers, enrollments, purchases, bookPurchases, reviews, blog, students, exams, settings] =
    await Promise.all([
      safe(admin.from("courses").select("*")),
      safe(admin.from("lessons").select("course_id, title, is_free_preview")),
      safe(admin.from("books").select("*")),
      safe(admin.from("offers").select("*")),
      safe(admin.from("enrollments").select("course_id, created_at", { count: "exact" })),
      safe(admin.from("purchases").select("*")),
      safe(admin.from("book_purchases").select("*")),
      safe(admin.from("reviews").select("*").limit(30)),
      safe(admin.from("blog_posts").select("title, is_published, created_at").limit(40)),
      safe(admin.from("profiles").select("id", { count: "exact", head: true })),
      safe(admin.from("exams").select("title")),
      safe(admin.from("site_settings").select("key")),
    ]);

  const lessonCount: Record<string, number> = {};
  for (const l of lessons.data) lessonCount[l.course_id] = (lessonCount[l.course_id] ?? 0) + 1;
  const enrollCount: Record<string, number> = {};
  for (const e of enrollments.data) enrollCount[e.course_id] = (enrollCount[e.course_id] ?? 0) + 1;

  const sumAmount = (rows: any[]) =>
    rows.filter((r) => !r.status || ["completed", "paid", "approved"].includes(String(r.status)))
      .reduce((s, r) => s + Number(r.amount ?? r.price ?? 0), 0);

  return {
    عدد_الطلاب_المسجلين: students.count,
    إجمالي_التسجيلات_في_الكورسات: enrollments.count,
    الكورسات: courses.data.map((c: any) => ({
      ...pick(c, ["title", "description", "price", "is_free", "level", "is_published"]),
      عدد_الدروس: lessonCount[c.id] ?? 0,
      عدد_المسجلين: enrollCount[c.id] ?? 0,
    })),
    الكتب: books.data.map((b: any) => pick(b, ["title", "description", "price", "is_published", "author"])),
    العروض: offers.data.map((o: any) => pick(o, ["title", "description", "discount_percentage", "is_active", "start_date", "end_date"])),
    المبيعات: {
      عدد_مشتريات_الكورسات: purchases.data.length,
      إيراد_الكورسات_USD: sumAmount(purchases.data),
      عدد_مشتريات_الكتب: bookPurchases.data.length,
      إيراد_الكتب_USD: sumAmount(bookPurchases.data),
    },
    آراء_الطلاب: reviews.data.map((r: any) => pick(r, ["rating", "comment", "content", "name"])),
    مقالات_المدونة: blog.data.map((b: any) => b.title),
    الامتحانات: exams.data.map((e: any) => e.title),
  };
}

const SYSTEM_PROMPT = (snapshot: unknown) => `أنت "مستشار نجاة الإعلاني" — خبير تسويق رقمي وإعلانات مدفوعة يعمل حصرياً لصالح منصة "نجاة للغة العربية" (Najat Arabic).

## عن المنصة
- منصة تعليمية متخصصة في تعليم اللغة العربية (لغة الضاد)، وتخصصها الأبرز علاج "صعوبات القراءة".
- تدعم 6 لغات للواجهة: العربية، الإنجليزية، الملايوية، الأردية، الإندونيسية، الفرنسية — أي أن الجمهور المستهدف عالمي (العالم العربي، ماليزيا، إندونيسيا، باكستان/الهند، الدول الفرنكوفونية، والجاليات المسلمة والعربية في الغرب).
- أقسام المنصة: الصفحة الرئيسية، الكورسات (دروس فيديو مع معاينة مجانية لدروس محددة بعد تسجيل الدخول)، ترجمة تلقائية للفيديوهات حسب لغة الطالب، الامتحانات الإلكترونية، الكتب (شراء وتحميل)، العروض، آراء الطلاب، المدونة متعددة اللغات، الفيديو التعريفي، المرشد الذكي، الدعم الفوري، والتواصل عبر واتساب (+962 7 9943 1399) وفيسبوك وإنستغرام.
- الدفع: بالدولار الأمريكي عبر بطاقات/Paddle و PayPal، وتحويل "كليك" في الأردن.
- العملة دائماً USD.

## بيانات المنصة الحية الآن (من قاعدة البيانات)
${JSON.stringify(snapshot, null, 1)}

## خبرتك
أنت خبير عميق في: Meta Ads (فيسبوك وإنستغرام — Ads Manager، Advantage+، هيكلة الحملات CBO/ABO، الأهداف، الجماهير المخصصة والمشابهة Lookalike، Pixel و Conversions API، أحداث التحويل، قواعد التعلم Learning Phase، الإعلانات الديناميكية، Reels)، Google Ads و YouTube، TikTok Ads، Snapchat، إعلانات واتساب Click-to-WhatsApp، كتابة نصوص إعلانية (Copywriting) بكل لغات المنصة، أفكار التصاميم والفيديوهات، اختبار A/B، حساب الميزانيات و CPA و ROAS و CAC و LTV، مسارات التحويل (Funnels)، إعادة الاستهداف، والتسويق بالمحتوى وتحسين محركات البحث.

## قواعد العمل
1. اعتمد دائماً على بيانات المنصة الحقيقية أعلاه عند اقتراح الحملات (أسماء الكورسات والكتب والأسعار والعروض الفعلية). لا تخترع كورسات أو أرقام غير موجودة؛ إذا لم تتوفر معلومة قل ذلك واطلبها.
2. أجب بدقة وعملية: خطوات قابلة للتنفيذ، أرقام ميزانيات مقترحة بالدولار، إعدادات استهداف محددة (الدول، الأعمار، الاهتمامات)، ونصوص إعلانية جاهزة للنسخ.
3. عند وضع خطة استخدم عناوين وجداول Markdown واضحة: الهدف، الجمهور، الميزانية، المدة، القنوات، الرسائل الإعلانية، مؤشرات القياس.
4. إذا احتجت معلومات حديثة عن سياسات أو تحديثات منصات الإعلانات استخدم البحث.
5. احترم سياسات Meta الإعلانية (تجنب الادعاءات المبالغ فيها، لا تستهدف خصائص شخصية حساسة بشكل مباشر في النص).
6. لا تستخدم نصوصاً دينية في الإعلانات.
7. أجب بلغة السؤال (غالباً العربية)، ويمكنك كتابة الإعلانات بأي لغة يطلبها المدير.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData?.user) return json({ error: "يجب تسجيل الدخول" }, 401);
    const userId = userData.user.id;

    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) return json({ error: "هذه الميزة للمدير فقط" }, 403);

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: "طلب غير صالح" }, 400);
    const { threadId } = parsed.data;
    const messages = parsed.data.messages as UIMessage[];

    const { data: thread } = await admin.from("ad_advisor_threads").select("id, title, user_id").eq("id", threadId).maybeSingle();
    if (!thread || thread.user_id !== userId) return json({ error: "المحادثة غير موجودة" }, 404);

    const apiKey = Deno.env.get("GOOGLE_API_KEY") || Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) return json({ error: "مفتاح الذكاء الاصطناعي غير مضبوط" }, 500);

    // Save the latest user message
    const last = messages[messages.length - 1];
    if (last?.role === "user") {
      const { error } = await admin.from("ad_advisor_messages").upsert(
        { thread_id: threadId, user_id: userId, message_id: last.id, role: "user", parts: last.parts },
        { onConflict: "thread_id,message_id" },
      );
      if (error) console.error("save user message failed", error);
      if (thread.title === "محادثة جديدة") {
        const text = (last.parts as any[]).filter((p) => p.type === "text").map((p) => p.text).join(" ").trim();
        if (text) await admin.from("ad_advisor_threads").update({ title: text.slice(0, 60) }).eq("id", threadId);
      }
    }
    await admin.from("ad_advisor_threads").update({ updated_at: new Date().toISOString() }).eq("id", threadId);

    const snapshot = await buildPlatformSnapshot(admin);
    const google = createGoogleGenerativeAI({ apiKey });

    const result = streamText({
      model: google("gemini-2.5-flash-lite"),
      system: SYSTEM_PROMPT(snapshot),
      messages: await convertToModelMessages(messages),
      tools: { google_search: google.tools.googleSearch({}) },
      abortSignal: req.signal,
    });

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      headers: corsHeaders,
      onError: (err: any) => {
        console.error("stream error", err);
        const msg = String(err?.message ?? err);
        if (msg.includes("429") || /quota|rate/i.test(msg)) return "تم تجاوز حد الاستخدام، حاول بعد قليل.";
        return "حدث خطأ أثناء توليد الرد.";
      },
      onFinish: async ({ responseMessage }) => {
        const { error } = await admin.from("ad_advisor_messages").upsert(
          { thread_id: threadId, user_id: userId, message_id: responseMessage.id || crypto.randomUUID(), role: "assistant", parts: responseMessage.parts },
          { onConflict: "thread_id,message_id" },
        );
        if (error) console.error("save assistant message failed", error);
      },
    });
  } catch (e) {
    console.error("ads-advisor error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
