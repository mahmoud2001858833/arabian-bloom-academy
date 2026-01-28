import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    // Format messages for Gemini API
    const formattedMessages = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Add system context as first user message if not already present
    const geminiMessages = [
      {
        role: 'user',
        parts: [{ text: PLATFORM_CONTEXT }]
      },
      {
        role: 'model', 
        parts: [{ text: 'مرحباً! أنا المرشد الذكي لمنصة Arabian Bloom Academy. كيف يمكنني مساعدتك اليوم؟' }]
      },
      ...formattedMessages
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || 'عذراً، لم أتمكن من الرد. حاول مرة أخرى.';

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
