import { supabase } from "@/integrations/supabase/client";

const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN;

declare global {
  interface Window {
    Paddle: any;
  }
}

let paddleInitialized = false;

export async function initializePaddle() {
  if (paddleInitialized) return;

  if (!clientToken) {
    throw new Error("VITE_PAYMENTS_CLIENT_TOKEN is not set");
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.onload = () => {
      const environment = clientToken.startsWith("test_") ? "sandbox" : "production";
      window.Paddle.Environment.set(environment);
      window.Paddle.Initialize({ token: clientToken });
      paddleInitialized = true;
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export async function getPaddlePriceId(priceId: string): Promise<string> {
  const environment = clientToken.startsWith("test_") ? "sandbox" : "live";
  const { data, error } = await supabase.functions.invoke("get-paddle-price", {
    body: { priceId, environment },
  });
  if (error || !data?.paddleId) {
    throw new Error(`Failed to resolve price: ${priceId}`);
  }
  return data.paddleId;
}

// Map course IDs to Paddle price IDs
const COURSE_PRICE_MAP: Record<string, string> = {
  'c8065df0-cee8-459a-9115-a60f7aea3e25': 'course_level_1_onetime',
  'b01ce979-1f6b-4fe2-aeb7-4aa21e407fa9': 'course_level_2_onetime',
  'aabddab6-b740-4079-88bd-9f9df1d4bb73': 'course_level_3_onetime',
};

export function getPaddlePriceIdForCourse(courseId: string): string | null {
  return COURSE_PRICE_MAP[courseId] || null;
}
