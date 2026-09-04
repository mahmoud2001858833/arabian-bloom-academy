import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

const GOOGLE_MODEL = "gemini-2.5-flash";

type OaiMessage = {
  role: string;
  content: string | Array<Record<string, any>>;
};

/** Calls Google Generative Language API directly with the user's own API key. */
async function callGoogle(apiKey: string, body: any): Promise<string> {
  const messages: OaiMessage[] = body?.messages ?? [];
  let systemInstruction: unknown = undefined;
  const contents: unknown[] = [];

  for (const msg of messages) {
    const parts: unknown[] = [];
    if (typeof msg.content === "string") {
      parts.push({ text: msg.content });
    } else {
      for (const part of msg.content) {
        if (part.type === "text") parts.push({ text: part.text });
        else if (part.type === "input_audio") {
          parts.push({
            inline_data: {
              mime_type: `audio/${part.input_audio?.format ?? "wav"}`,
              data: part.input_audio?.data,
            },
          });
        }
      }
    }
    if (msg.role === "system") systemInstruction = { parts };
    else contents.push({ role: "user", parts });
  }

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${GOOGLE_MODEL}:generateContent?key=${apiKey}`;

  let attempt = 0;
  while (true) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        ...(systemInstruction ? { systemInstruction } : {}),
        generationConfig: { temperature: 0.2 },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const parts = data?.candidates?.[0]?.content?.parts ?? [];
      return parts.map((p: { text?: string }) => p.text ?? "").join("").trim();
    }

    const errorText = await res.text();
    console.error(`Google AI error [${res.status}]: ${errorText}`);

    if (res.status === 429 || res.status >= 500) {
      attempt++;
      if (attempt > 3) throw new Error(`[${res.status}]: ${errorText}`);
      await new Promise((r) => setTimeout(r, Math.min(20000, 2000 * 2 ** (attempt - 1))));
      continue;
    }

    throw new Error(`[${res.status}]: ${errorText}`);
  }
}

async function callGateway(apiKey: string, body: unknown): Promise<string> {
  // Prefer the project's own Google AI key when available.
  const googleKey = Deno.env.get("GOOGLE_API_KEY") ?? Deno.env.get("GEMINI_API_KEY");
  if (googleKey) return callGoogle(googleKey, body);

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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY") ?? "";
    const HAS_AI_KEY = !!(Deno.env.get("GOOGLE_API_KEY") ?? Deno.env.get("GEMINI_API_KEY") ?? LOVABLE_API_KEY);
    if (!HAS_AI_KEY) {
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
    const action: string = payload?.action ?? "finalize";
    lessonId = payload?.lesson_id ?? null;
    if (!lessonId) {
      return new Response(JSON.stringify({ error: "lesson_id مطلوب" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Step 1: transcribe one audio chunk (Arabic speech -> timed text) ---
    if (action === "transcribe_chunk") {
      const audioBase64: string = payload?.audio_base64 ?? "";
      const offset: number = Number(payload?.offset) || 0;
      if (!audioBase64) {
        return new Response(JSON.stringify({ error: "المقطع الصوتي مفقود" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await admin
        .from("lessons")
        .update({ subtitle_status: "processing", subtitle_error: null })
        .eq("id", lessonId);

      const raw = await callGateway(LOVABLE_API_KEY, {
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text:
                  `فرّغ الكلام العربي المنطوق في هذا التسجيل إلى نص مع التوقيتات الدقيقة.\n` +
                  `مدة التسجيل بالثواني: ${Number(payload?.duration) || 0}.\n` +
                  `أعد JSON صالحاً فقط بدون أي شرح أو أسوار كود بالشكل:\n` +
                  `{"segments":[{"start":0,"end":4.5,"text":"..."}]}\n` +
                  `قواعد صارمة: start و end بالثواني من بداية هذا التسجيل تحديداً، ` +
                  `ويجب أن يكون start مساوياً للحظة نطق أول كلمة في المقطع (لا قبلها)، ` +
                  `و end لحظة انتهاء آخر كلمة. التوقيتات تصاعدية ولا تتداخل، ` +
                  `وآخر end لا يتجاوز مدة التسجيل. كل مقطع من 3 إلى 8 ثوانٍ وجملة قصيرة مقروءة. ` +
                  `لا تضغط التوقيتات في بداية التسجيل، وزّعها على كامل المدة حسب الصوت الفعلي.`,
              },
              { type: "input_audio", input_audio: { data: audioBase64, format: "wav" } },
            ],
          },
        ],
      });

      let parsedSegments: Segment[] = [];
      try {
        const parsed = JSON.parse(stripFence(raw));
        parsedSegments = Array.isArray(parsed) ? parsed : (parsed.segments ?? []);
      } catch {
        throw new Error("تعذّر قراءة نتيجة التفريغ الصوتي");
      }

      const duration = Number(payload?.duration) || 0;

      // Clean, then repair the model's timings so the text stays glued to the audio.
      let local = parsedSegments
        .map((s) => ({
          start: Math.max(0, Number(s.start) || 0),
          end: Math.max(0, Number(s.end) || 0),
          text: String(s.text ?? "").trim(),
        }))
        .filter((s) => s.text)
        .sort((a, b) => a.start - b.start);

      if (local.length > 0 && duration > 0) {
        const maxEnd = Math.max(...local.map((s) => s.end || s.start));
        // The model often compresses (subtitles run ahead of the voice) or
        // overshoots the clip; rescale linearly onto the real chunk duration.
        if (maxEnd > 0 && (maxEnd < duration * 0.9 || maxEnd > duration * 1.02)) {
          const scale = duration / maxEnd;
          local = local.map((s) => ({ ...s, start: s.start * scale, end: s.end * scale }));
        }
      }

      // Enforce monotonic, non-overlapping, readable cues.
      let prevEnd = 0;
      local = local.map((s) => {
        const start = Math.max(s.start, prevEnd);
        let end = s.end > start ? s.end : start + 2.5;
        if (duration > 0) end = Math.min(end, duration);
        if (end <= start) end = start + 1.2;
        prevEnd = end;
        return { start, end, text: s.text };
      });

      const chunkSegments = local.map((s) => ({
        start: s.start + offset,
        end: s.end + offset,
        text: s.text,
      }));

      return new Response(JSON.stringify({ success: true, segments: chunkSegments }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }


    // --- Step 2: translate the full transcript and store the subtitle files ---
    const incoming: Segment[] = Array.isArray(payload?.segments) ? payload.segments : [];
    const segments: Segment[] = incoming
      .map((s) => ({ start: Number(s.start) || 0, end: Number(s.end) || 0, text: String(s.text ?? "").trim() }))
      .filter((s) => s.text)
      .sort((a, b) => a.start - b.start);

    if (segments.length === 0) {
      throw new Error("لم يتم العثور على كلام قابل للتفريغ في الفيديو");
    }

    const rows: { lesson_id: string; language: string; content: string }[] = [
      { lesson_id: lessonId, language: "ar", content: toVtt(segments) },
    ];

    // Translate the transcript into every supported language.
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
    const raw = error instanceof Error ? error.message : String(error);
    console.error("transcribe-lesson-video failed:", raw);

    // Map AI gateway billing/policy errors to a clear, user-facing message.
    let status = 500;
    let message = raw;
    if (raw.startsWith("[402]")) {
      status = 402;
      message = "لا يوجد رصيد كافٍ للذكاء الاصطناعي. يرجى شحن رصيد المنصة ثم إعادة المحاولة.";
    } else if (raw.startsWith("[403]")) {
      status = 403;
      message = "خدمة الذكاء الاصطناعي غير مفعّلة أو تم بلوغ حد الاستخدام.";
    } else if (raw.startsWith("[429]")) {
      status = 429;
      message = "تم تجاوز حد الطلبات مؤقتاً. يرجى المحاولة بعد قليل.";
    }

    if (lessonId) {
      await admin
        .from("lessons")
        .update({ subtitle_status: "failed", subtitle_error: message.slice(0, 500) })
        .eq("id", lessonId);
    }
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});