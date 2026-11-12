// One place that decides which AI endpoint the edge functions use.
//
// Preferred: Google Gemini directly (GOOGLE_API_KEY, else GEMINI_API_KEY secret) through
// Google's OpenAI-compatible endpoint, so request and response keep the same
// `messages` / `choices` shape the functions already use.
// Fallback: the Lovable AI gateway, only if no Google key is configured.

// gemini-2.5-flash-lite is closed to new Google accounts. 3.1 is the cheaper one;
// 3.5 is the one Google recommends, used if 3.1 is not available for this key.
export const AI_MODELS = ["gemini-3.1-flash-lite", "gemini-3.5-flash-lite"];

const GOOGLE_CHAT_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const LOVABLE_CHAT_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

export interface AiEndpoint {
  url: string;
  apiKey: string;
  model: string;
  isGoogle: boolean;
}

export function aiEndpoint(): AiEndpoint | null {
  const googleKey = Deno.env.get("GOOGLE_API_KEY") || Deno.env.get("GEMINI_API_KEY");
  if (googleKey) return { url: GOOGLE_CHAT_URL, apiKey: googleKey, model: AI_MODELS[0], isGoogle: true };

  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  if (lovableKey) {
    return { url: LOVABLE_CHAT_URL, apiKey: lovableKey, model: "google/gemini-2.5-flash-lite", isGoogle: false };
  }

  return null;
}

/**
 * fetch() for a chat completion. With Google, if a model answers 404 (not available
 * for this key) it retries with the next model in AI_MODELS. The JSON body's `model`
 * is set here, so callers can leave any value in it.
 */
export async function fetchAiChat(ai: AiEndpoint, init: RequestInit): Promise<Response> {
  const body = JSON.parse(String(init.body ?? "{}"));
  const models = ai.isGoogle ? AI_MODELS : [ai.model];
  let res: Response | null = null;
  for (const model of models) {
    res = await fetch(ai.url, { ...init, body: JSON.stringify({ ...body, model }) });
    if (res.status !== 404) break;
    console.error(`AI model ${model} not available (404), trying next`);
  }
  return res!;
}
