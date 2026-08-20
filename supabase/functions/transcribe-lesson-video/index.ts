import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const WORKER_URL = "https://bitter-cloud-d66f.janamuhmad.workers.dev";
const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

const TARGET_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "ms", name: "Malay" },
  { code: "ur", name: "Urdu" },
  { code: "id", name: "Indonesian" },
  { code: "fr", name: "French" },
];

interface Segment {
  start: number;
  end: number;
  text: string;
}

function buildVideoUrl(videoKey: string): string {
  if (!videoKey) return "";
  let key = videoKey;
  if (key.startsWith("http")) {
    try {
      const url = new URL(key);
      const parts = url.pathname.split("/");
      key = parts[parts.length - 1];
    } catch {
      return key;
    }
  }
  return `${WORKER_URL}/video/${key}`;
}

function stripFence(raw: string): string {
  return raw.replace(/^\s*```(?:json)?/i, "").replace(/```\s*$/, "").trim();
}

function toTimestamp(seconds: number): string {
  const s = Math.max(0, seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  const ms = Math.round((s - Math.floor(s)) * 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
}

function toVtt(segments: Segment[]): string {
  const body = segments
    .filter((s) => s.text && s.text.trim())
    .map((s, i) => {
      const end = s.end > s.start ? s.end : s.start + 2;
      return `${i + 1}\n${toTimestamp(s.start)} --> ${toTimestamp(end)}\n${s.text.trim()}`;
    })
    .join("\n\n");
  return `WEBVTT\n\n${body}\n`;
}

async function callGateway(apiKey: string, body: unknown): Promise<string> {
  let attempt = 0;
  // Only 429 / 5xx are retryable, with bounded backoff.
  while (true) {
    const res = await fetch(GATEWAY, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return data?.choices?.[0]?.message?.content ?? "";
    }

    const errorText = await res.text();
    console.error(`AI gateway error [${res.status}]: ${errorText}`);

    if (res.status === 429 || res.status >= 500) {
      attempt++;
      if (attempt > 3) {
        throw new Error(`[${res.status}]: ${errorText}`);
      }
      const retryAfter = Number(res.headers.get("retry-after"));
      const delay = Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : Math.min(20000, 2000 * 2 ** (attempt - 1)) + Math.random() * 500;
      await new Promise((r) => setTimeout(r, delay));
      continue;
    }

    throw new Error(`[${res.status}]: ${errorText}`);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceKey);

  let lessonId: string | null = null;

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "خدمة الذكاء الاصطناعي غير مهيأة" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Authenticate the caller and require the admin role.
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await admin.auth.getUser(token);
    const user = userData?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "غير مصرح" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "هذه العملية للمشرفين فقط" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = await req.json();
    lessonId = payload?.lesson_id ?? null;
    if (!lessonId) {
      return new Response(JSON.stringify({ error: "lesson_id مطلوب" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: lesson, error: lessonError } = await admin
      .from("lessons")
      .select("id, title, video_url")
      .eq("id", lessonId)
      .maybeSingle();

    if (lessonError) throw lessonError;
    if (!lesson?.video_url) {
      return new Response(JSON.stringify({ error: "لا يوجد فيديو لهذا الدرس" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await admin
      .from("lessons")
      .update({ subtitle_status: "processing", subtitle_error: null })
      .eq("id", lessonId);

    const videoUrl = buildVideoUrl(lesson.video_url);

    // 1) Speech to text (Arabic) with timings.
    const transcriptRaw = await callGateway(LOVABLE_API_KEY, {
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                `فرّغ الكلام المنطوق في هذا الفيديو التعليمي إلى نص عربي دقيق مع التوقيتات.\n` +
                `أعد JSON صالحاً فقط بدون أي شرح أو أسوار كود، بالشكل:\n` +
                `{"segments":[{"start":0,"end":4.5,"text":"..."}]}\n` +
                `start و end بالثواني (أرقام)، وكل مقطع من 3 إلى 8 ثوانٍ تقريباً وجملة قصيرة مقروءة.`,
            },
            { type: "video_url", video_url: { url: videoUrl } },
          ],
        },
      ],
    });

    let segments: Segment[] = [];
    try {
      const parsed = JSON.parse(stripFence(transcriptRaw));
      segments = Array.isArray(parsed) ? parsed : (parsed.segments ?? []);
    } catch {
      throw new Error("تعذّر قراءة نتيجة التفريغ الصوتي");
    }

    segments = segments
      .map((s) => ({ start: Number(s.start) || 0, end: Number(s.end) || 0, text: String(s.text ?? "") }))
      .filter((s) => s.text.trim());

    if (segments.length === 0) {
      throw new Error("لم يتم العثور على كلام قابل للتفريغ في الفيديو");
    }

    const rows: { lesson_id: string; language: string; content: string }[] = [
      { lesson_id: lessonId, language: "ar", content: toVtt(segments) },
    ];

    // 2) Translate the segments into every supported language.
    for (const lang of TARGET_LANGUAGES) {
      try {
        const raw = await callGateway(LOVABLE_API_KEY, {
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content:
                "You are a professional subtitle translator for Arabic educational content. Return ONLY valid JSON, no markdown.",
            },
            {
              role: "user",
              content:
                `Translate every subtitle line below from Arabic into ${lang.name}. ` +
                `Keep the same number of items and the same order. ` +
                `Return {"lines":["...","..."]} only.\n\n` +
                JSON.stringify(segments.map((s) => s.text)),
            },
          ],
        });

        const parsed = JSON.parse(stripFence(raw));
        const lines: string[] = Array.isArray(parsed) ? parsed : (parsed.lines ?? []);
        if (lines.length !== segments.length) {
          console.error(`Translation length mismatch for ${lang.code}`);
          continue;
        }
        const translated = segments.map((s, i) => ({ ...s, text: lines[i] }));
        rows.push({ lesson_id: lessonId, language: lang.code, content: toVtt(translated) });
      } catch (e) {
        console.error(`Translation failed for ${lang.code}:`, e);
      }
    }

    const { error: upsertError } = await admin
      .from("lesson_subtitles")
      .upsert(rows, { onConflict: "lesson_id,language" });
    if (upsertError) throw upsertError;

    await admin
      .from("lessons")
      .update({
        subtitle_status: "ready",
        subtitle_error: null,
        subtitle_generated_at: new Date().toISOString(),
      })
      .eq("id", lessonId);

    return new Response(
      JSON.stringify({ success: true, languages: rows.map((r) => r.language), segments: segments.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("transcribe-lesson-video failed:", message);
    if (lessonId) {
      await admin
        .from("lessons")
        .update({ subtitle_status: "failed", subtitle_error: message.slice(0, 500) })
        .eq("id", lessonId);
    }
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});