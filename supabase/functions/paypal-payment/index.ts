import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const PAYPAL_CLIENT_ID = 'AUCQVJMlnhCbKztLg0RvdZnNvyxDfxlpMs7N5BETGwSPPjrgzek20HdTAvGMjLzXJrH_NjTrQVloohDv';
const PAYPAL_BASE_URL = 'https://api-m.paypal.com'; // Production

async function getPayPalAccessToken(): Promise<string> {
  const secret = Deno.env.get('PAYPAL_SECRET');
  if (!secret) {
    throw new Error('PAYPAL_SECRET environment variable is not set');
  }
  
  const auth = btoa(`${PAYPAL_CLIENT_ID}:${secret}`);

  const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('PayPal auth error:', data);
    throw new Error('Failed to get PayPal access token');
  }
  return data.access_token;
}

async function createOrder(amount: number, courseTitle: string): Promise<string> {
  const accessToken = await getPayPalAccessToken();

  const res = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: amount.toFixed(2),
        },
        description: courseTitle,
      }],
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('PayPal create order error:', data);
    throw new Error('Failed to create PayPal order');
  }
  return data.id;
}

async function getOrderStatus(orderID: string): Promise<string> {
  const accessToken = await getPayPalAccessToken();
  const res = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  const data = await res.json();
  return data.status || 'UNKNOWN';
}

async function captureOrder(orderID: string): Promise<any> {
  const accessToken = await getPayPalAccessToken();

  const res = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('PayPal capture error:', data);
    throw new Error('Failed to capture PayPal order');
  }
  return data;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }
    const userId = claimsData.claims.sub;

    const body = await req.json();
    const { action, courseId, amount, orderID, courseTitle } = body;

    if (action === 'create') {
      if (!courseId || !amount || !courseTitle) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: corsHeaders });
      }

      const paypalOrderId = await createOrder(amount, courseTitle);
      return new Response(JSON.stringify({ orderID: paypalOrderId }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } else if (action === 'capture') {
      if (!orderID || !courseId) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: corsHeaders });
      }

      // Check if order was approved before trying to capture
      const orderStatus = await getOrderStatus(orderID);
      if (orderStatus !== 'APPROVED') {
        return new Response(JSON.stringify({ error: 'Payment not approved', status: orderStatus }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const captureData = await captureOrder(orderID);

      if (captureData.status === 'COMPLETED') {
        const serviceClient = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        // Record purchase
        const capturedAmount = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || '0';
        await serviceClient.from('purchases').insert({
          user_id: userId,
          course_id: courseId,
          amount: parseFloat(capturedAmount),
          stripe_payment_id: orderID,
          status: 'completed',
        });

        // Enroll student
        await serviceClient.from('enrollments').insert({
          user_id: userId,
          course_id: courseId,
        });

        return new Response(JSON.stringify({ success: true, status: captureData.status }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } else {
        return new Response(JSON.stringify({ error: 'Payment not completed', status: captureData.status }), { status: 400, headers: corsHeaders });
      }

    } else {
      return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400, headers: corsHeaders });
    }

  } catch (error) {
    console.error('PayPal payment error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});
