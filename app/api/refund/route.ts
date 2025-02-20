import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // USDC on Base
const REFUND_AMOUNT = '1000000'; // 1 USDC (6 decimals)

export async function POST(req: Request) {
  try {
    const { chargeId } = await req.json();
    console.log('Processing refund for charge:', chargeId);

    // Get charge details
    const charge = await fetch(`https://api.commerce.coinbase.com/charges/${chargeId}`, {
      headers: {
        'X-CC-Api-Key': process.env.COINBASE_COMMERCE_API_KEY!,
      }
    }).then(res => res.json());

    console.log('Charge data:', charge);

    if (!charge.data?.timeline?.find((t: any) => t.status === 'COMPLETED')) {
      throw new Error('Charge has not been paid');
    }

    const payerAddress = charge.data.addresses.usdc;
    if (!payerAddress) {
      throw new Error('No USDC payer address found');
    }

    console.log('Sending refund to:', payerAddress);

    // Send refund
    const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
    
    const usdcContract = new ethers.Contract(
      USDC_ADDRESS,
      ['function transfer(address to, uint256 amount) returns (bool)'],
      wallet
    );

    const tx = await usdcContract.transfer(payerAddress, REFUND_AMOUNT);
    console.log('Refund transaction sent:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('Refund confirmed:', receipt.hash);

    return NextResponse.json({
      message: 'Refund sent successfully! 🎉',
      transactionHash: receipt.hash,
      amount: '1 USDC'
    });
  } catch (error) {
    console.error('Refund failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process refund' },
      { status: 500 }
    );
  }
} 