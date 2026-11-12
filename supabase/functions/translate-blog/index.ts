import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { aiEndpoint } from "../_shared/ai.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const LANGUAGES = [
  { code: 'ar', name: 'Arabic' },
  { code: 'en', name: 'English' },
  { code: 'ms', name: 'Malay' },
  { code: 'ur', name: 'Urdu' },
  { code: 'id', name: 'Indonesian' },
  { code: 'fr', name: 'French' },
];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { title, description, content, sourceLang = 'ar' } = await req.json();
    
    if (!title || !content) {
      return new Response(
        JSON.stringify({ error: 'Title and content are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ai = aiEndpoint();
    if (!ai) {
      console.error('AI key is not configured (GEMINI_API_KEY)');
      return new Response(
        JSON.stringify({ error: 'Translation service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get target languages (exclude source language)
    const targetLanguages = LANGUAGES.filter(lang => lang.code !== sourceLang);
    
    // Create translation prompt
    const translationPrompt = `You are a professional translator. Translate the following blog post content from ${LANGUAGES.find(l => l.code === sourceLang)?.name || 'Arabic'} to the following languages: ${targetLanguages.map(l => l.name).join(', ')}.

IMPORTANT RULES:
1. Maintain the exact meaning and tone of the original
2. Keep any technical terms or proper nouns intact
3. Preserve the formatting and paragraph structure
4. For RTL languages (Arabic, Urdu), maintain appropriate text direction context
5. Return ONLY valid JSON, no markdown, no code blocks

INPUT:
Title: ${title}
${description ? `Description: ${description}` : ''}
Content: ${content}

OUTPUT FORMAT (JSON only):
{
${targetLanguages.map(lang => `  "${lang.code}": {
    "title": "translated title in ${lang.name}",
    "description": "translated description in ${lang.name}",
    "content": "translated content in ${lang.name}"
  }`).join(',\n')}
}`;

    console.log('Sending translation request to Lovable AI...');
    
    const response = await fetch(ai.url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ai.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: ai.model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional multilingual translator. Always respond with valid JSON only, no markdown formatting or code blocks.'
          },
          {
            role: 'user',
            content: translationPrompt
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Translation service quota exceeded.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Translation service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const translationText = aiResponse.choices?.[0]?.message?.content;
    
    if (!translationText) {
      console.error('No translation content received');
      return new Response(
        JSON.stringify({ error: 'No translation received' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Raw translation response:', translationText.substring(0, 500));
    
    // Clean the response - remove markdown code blocks if present
    let cleanedText = translationText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.slice(7);
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.slice(3);
    }
    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.slice(0, -3);
    }
    cleanedText = cleanedText.trim();

    // Parse the translation JSON
    let translations;
    try {
      translations = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse translation JSON:', parseError);
      console.error('Cleaned text:', cleanedText.substring(0, 500));
      return new Response(
        JSON.stringify({ error: 'Failed to parse translation response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Add source language content
    translations[sourceLang] = { title, description: description || '', content };

    console.log('Translation successful for languages:', Object.keys(translations).join(', '));

    return new Response(
      JSON.stringify({ translations }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Translation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
