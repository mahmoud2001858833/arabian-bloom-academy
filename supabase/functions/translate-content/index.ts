import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { aiEndpoint, fetchAiChat } from "../_shared/ai.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ms', name: 'Malay' },
  { code: 'ur', name: 'Urdu' },
  { code: 'id', name: 'Indonesian' },
  { code: 'fr', name: 'French' },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { title, description } = await req.json();

    if (!title) {
      return new Response(
        JSON.stringify({ error: 'Title is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ai = aiEndpoint();
    if (!ai) {
      return new Response(
        JSON.stringify({ error: 'Translation service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `You are a professional translator specializing in educational content. Translate the following Arabic educational content into ${LANGUAGES.map(l => l.name).join(', ')}.

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks.

INPUT:
Title (Arabic): ${title}
${description ? `Description (Arabic): ${description}` : ''}

OUTPUT FORMAT:
{
${LANGUAGES.map(lang => `  "${lang.code}": { "title": "translated title in ${lang.name}"${description ? `, "description": "translated description in ${lang.name}"` : ''} }`).join(',\n')}
}`;

    const response = await fetchAiChat(ai, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ai.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: ai.model,
        messages: [
          { role: 'system', content: 'You are a professional translator. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Translation service error' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    let text = aiResponse.choices?.[0]?.message?.content?.trim() || '';

    // Clean markdown code blocks
    if (text.startsWith('```json')) text = text.slice(7);
    else if (text.startsWith('```')) text = text.slice(3);
    if (text.endsWith('```')) text = text.slice(0, -3);
    text = text.trim();

    const translations = JSON.parse(text);

    return new Response(
      JSON.stringify({ translations }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Translation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
