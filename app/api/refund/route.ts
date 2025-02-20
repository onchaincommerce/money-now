import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // USDC on Base
const REFUND_AMOUNT = '1000000'; // 1 USDC (6 decimals)

export async function POST(req: Request) {
  try {
    const { chargeId } = await req.json();

    // Get charge details from Coinbase Commerce
    const chargeResponse = await fetch(`https://api.commerce.coinbase.com/charges/${chargeId}`, {
      headers: {
        'X-CC-Api-Key': process.env.COINBASE_COMMERCE_API_KEY!,
      }
    });
    const chargeData = await chargeResponse.json();
    console.log('Charge data:', chargeData);

    // Get the payer's address from timeline events
    const paymentEvent = chargeData.data.timeline.find((event: any) => 
      event.status === 'COMPLETED' && event.payment
    );

    if (!paymentEvent?.payment?.transaction?.addresses?.usdc) {
      return NextResponse.json(
        { error: 'No USDC payment address found for this charge' },
        { status: 400 }
      );
    }

    const payerAddress = paymentEvent.payment.transaction.addresses.usdc;
    console.log('Payer address:', payerAddress);

    // Initialize provider and wallet
    const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
    
    // Create USDC contract instance
    const usdcContract = new ethers.Contract(
      USDC_ADDRESS,
      ['function transfer(address to, uint256 amount) returns (bool)'],
      wallet
    );

    // Send refund transaction
    const tx = await usdcContract.transfer(payerAddress, REFUND_AMOUNT);
    console.log('Transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt.hash);

    return NextResponse.json({
      success: true,
      transactionHash: receipt.hash,
      amount: '1 USDC'
    });
  } catch (error) {
    console.error('Refund error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process refund' },
      { status: 500 }
    );
  }
} 