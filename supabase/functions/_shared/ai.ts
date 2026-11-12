// One place that decides which AI endpoint the edge functions use.
//
// Preferred: Google Gemini directly (GEMINI_API_KEY or GOOGLE_API_KEY secret) with
// gemini-2.5-flash-lite, through Google's OpenAI-compatible endpoint, so request and
// response keep the same `messages` / `choices` shape the functions already use.
// Fallback: the Lovable AI gateway, only if no Google key is configured.

export const AI_MODEL = "gemini-2.5-flash-lite";

const GOOGLE_CHAT_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const LOVABLE_CHAT_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

export interface AiEndpoint {
  url: string;
  apiKey: string;
  model: string;
}

export function aiEndpoint(): AiEndpoint | null {
  const googleKey = Deno.env.get("GEMINI_API_KEY") ?? Deno.env.get("GOOGLE_API_KEY");
  if (googleKey) return { url: GOOGLE_CHAT_URL, apiKey: googleKey, model: AI_MODEL };

  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  if (lovableKey) return { url: LOVABLE_CHAT_URL, apiKey: lovableKey, model: `google/${AI_MODEL}` };

  return null;
}
