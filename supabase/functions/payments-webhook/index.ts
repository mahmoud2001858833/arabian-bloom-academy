import { createClient } from 'npm:@supabase/supabase-js@2';
import { verifyWebhook, EventName, type PaddleEnv } from '../_shared/paddle.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Mapping of Paddle product external IDs to course UUIDs
const PRODUCT_TO_COURSE: Record<string, string> = {
  'course_level_1': 'c8065df0-cee8-459a-9115-a60f7aea3e25',
  'course_level_2': 'b01ce979-1f6b-4fe2-aeb7-4aa21e407fa9',
  'course_level_3': 'aabddab6-b740-4079-88bd-9f9df1d4bb73',
};

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const url = new URL(req.url);
  const env = (url.searchParams.get('env') || 'sandbox') as PaddleEnv;

  try {
    const event = await verifyWebhook(req, env);
    console.log('Received event:', event.eventType, 'env:', env);

    switch (event.eventType) {
      case EventName.TransactionCompleted:
        await handleTransactionCompleted(event.data, env);
        break;
      case EventName.TransactionPaymentFailed:
        console.log('Payment failed:', event.data.id, 'env:', env);
        break;
      default:
        console.log('Unhandled event:', event.eventType);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Webhook error:', e);
    return new Response('Webhook error', { status: 400 });
  }
});

async function handleTransactionCompleted(data: any, env: PaddleEnv) {
  const { id, customData, items } = data;
  
  const userId = customData?.userId;
  if (!userId) {
    console.error('No userId in customData for transaction:', id);
    return;
  }

  // Get the product external ID from the transaction items
  for (const item of items) {
    const productExternalId = item.price?.importMeta?.externalId?.replace(/_onetime$/, '') 
      || item.product?.importMeta?.externalId;
    
    const courseId = productExternalId ? PRODUCT_TO_COURSE[productExternalId] : null;
    
    if (!courseId) {
      console.error('Could not map product to course:', productExternalId);
      continue;
    }

    // Create enrollment for the user
    const { error: enrollError } = await supabase
      .from('enrollments')
      .upsert({
        user_id: userId,
        course_id: courseId,
        enrolled_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,course_id',
        ignoreDuplicates: true,
      });

    if (enrollError) {
      console.error('Error creating enrollment:', enrollError);
    } else {
      console.log(`Enrolled user ${userId} in course ${courseId} via transaction ${id}`);
    }

    // Record the purchase
    const { error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        user_id: userId,
        course_id: courseId,
        amount: item.price?.unitPrice?.amount ? parseInt(item.price.unitPrice.amount) / 100 : 0,
        stripe_payment_id: id, // reusing this column for paddle transaction ID
        status: 'completed',
      });

    if (purchaseError) {
      console.error('Error recording purchase:', purchaseError);
    }
  }
}
