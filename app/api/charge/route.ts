import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { chargeId } = await req.json();

    const chargeResponse = await fetch(`https://api.commerce.coinbase.com/charges/${chargeId}`, {
      headers: {
        'X-CC-Api-Key': process.env.COINBASE_COMMERCE_API_KEY!,
      }
    });

    if (!chargeResponse.ok) {
      throw new Error(`Failed to fetch charge: ${chargeResponse.status}`);
    }

    const chargeData = await chargeResponse.json();
    return NextResponse.json(chargeData);
  } catch (error) {
    console.error('Error fetching charge:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch charge' },
      { status: 500 }
    );
  }
} 