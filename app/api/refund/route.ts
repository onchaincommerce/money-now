import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { chargeId } = await req.json();

    // Call Coinbase Commerce API to process the refund
    const response = await fetch(`https://api.commerce.coinbase.com/charges/${chargeId}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CC-Api-Key': process.env.COINBASE_COMMERCE_API_KEY!,
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to process refund');
    }

    return NextResponse.json({
      message: 'Refund processed successfully! 🎉',
      transactionHash: data.data?.transaction?.hash,
      amount: data.data?.amount?.value
    });
  } catch (error) {
    console.error('Refund error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process refund' },
      { status: 500 }
    );
  }
} 