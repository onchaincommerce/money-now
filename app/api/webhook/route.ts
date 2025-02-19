import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Simple set to track pending charge IDs
const pendingCharges = new Set<string>();

function verifyWebhookSignature(
  signature: string,
  body: string,
  webhookSecret: string
): boolean {
  const hmac = crypto.createHmac('sha256', webhookSecret);
  hmac.update(body);
  const computedSignature = hmac.digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computedSignature)
  );
}

function logWebhookError(error: any, context: string) {
  console.error(`Webhook ${context} error:`, {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-cc-webhook-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 401 }
      );
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(
      signature,
      rawBody,
      process.env.COINBASE_COMMERCE_WEBHOOK_SECRET!
    );

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse the body after verification
    const event = JSON.parse(rawBody);
    
    // Log the full event for debugging
    console.log('Webhook event received:', JSON.stringify(event, null, 2));

    // Handle different webhook events
    switch (event.type) {
      case 'charge:pending':
        const chargeId = event.data.id;
        pendingCharges.add(chargeId);
        console.log(`Payment pending for charge: ${chargeId}`);
        break;
      
      case 'charge:failed':
        const failedChargeId = event.data.id;
        pendingCharges.delete(failedChargeId);
        console.log(`Payment failed for charge: ${failedChargeId}`);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    logWebhookError(error, 'processing');
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Export the pending charges set
export { pendingCharges }; 