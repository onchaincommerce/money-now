import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Received webhook event:', body);

    // Handle the webhook event
    const { type, data } = body;
    
    switch (type) {
      case 'checkout.completed':
        console.log('Checkout completed:', data);
        break;
      case 'checkout.failed':
        console.log('Checkout failed:', data);
        break;
      default:
        console.log('Unhandled event type:', type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 