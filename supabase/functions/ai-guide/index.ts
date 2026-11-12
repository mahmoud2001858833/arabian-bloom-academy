import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { aiEndpoint, fetchAiChat } from "../_shared/ai.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const PLATFORM_CONTEXT = `أنت مرشد ذكي لمنصة "Arabian Bloom Academy" لتعليم اللغة العربية.

معلومات المنصة:
- الصفحة الرئيسية (/) - تعرض نظرة عامة عن المنصة والكورسات المميزة
- صفحة الكورسات (/courses) - تعرض جميع الكورسات المتاحة للتسجيل
- صفحة من نحن (/about) - معلومات عن المنصة والفريق
- لوحة الطالب (/dashboard) - تعرض الكورسات المسجل فيها الطالب وتقدمه
- صفحة تسجيل الدخول (/auth) - للتسجيل وتسجيل الدخول

كيفية التسجيل في كورس:
1. اذهب لصفحة الكورسات واختر الكورس المناسب
2. إذا كان الكورس مجاني، يمكنك التسجيل مباشرة
3. إذا كان الكورس مدفوع، ستحتاج لرفع إيصال الدفع عبر نظام "الكلك" ثم انتظار موافقة الإدارة

نظام الدفع:
- نستخدم نظام الدفع "كلك" للتحويل البنكي
- بعد التحويل، ارفع صورة الإيصال وانتظر الموافقة
- بعد الموافقة ستحصل على وصول كامل للكورس

مستويات الكورسات:
- مبتدئ: للمتعلمين الجدد
- متوسط: لمن لديهم أساسيات اللغة
- متقدم: لتطوير المهارات المتقدمة

قواعد مهمة:
1. كن ودوداً ومساعداً دائماً
2. أجب باللغة العربية
3. إذا طلب المستخدم الانتقال لصفحة معينة، اسأله أولاً للتأكيد ثم أعطه الرابط بصيغة JSON خاصة
4. عندما يريد المستخدم الانتقال لمكان معين، رد بهذه الصيغة بالضبط:
   {"navigate": "/path", "message": "رسالتك هنا"}
   
مثال: إذا قال "خذني لصفحة الكورسات"، رد:
{"navigate": "/courses", "message": "سأنقلك الآن إلى صفحة الكورسات. هل تريد المتابعة؟"}

5. لا تنتقل مباشرة، اسأل دائماً للتأكيد أولاً`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const ai = aiEndpoint();
    if (!ai) {
      throw new Error("AI key is not configured (GEMINI_API_KEY)");
    }

    // Format messages for Lovable AI Gateway (OpenAI-compatible format)
    const formattedMessages = [
      { role: 'system', content: PLATFORM_CONTEXT },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    console.log("Calling Lovable AI Gateway...");

    const response = await fetchAiChat(ai,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ai.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: ai.model,
          messages: formattedMessages,
          temperature: 0.7,
          max_tokens: 1024,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { 
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { 
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || 'عذراً، لم أتمكن من الرد. حاول مرة أخرى.';

    console.log("AI response received successfully");

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("AI Guide error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
