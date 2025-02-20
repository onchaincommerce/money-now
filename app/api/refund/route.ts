import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // USDC on Base
const REFUND_AMOUNT = '1000000'; // 1 USDC (6 decimals)

export async function POST(req: Request) {
  try {
    const { chargeId } = await req.json();

    // First, get the charge details to find the payer's address
    const chargeResponse = await fetch(`https://api.commerce.coinbase.com/charges/${chargeId}`, {
      headers: {
        'X-CC-Api-Key': process.env.COINBASE_COMMERCE_API_KEY!,
        'Accept': 'application/json',
      }
    });

    const chargeData = await chargeResponse.json();
    
    if (!chargeResponse.ok) {
      throw new Error('Failed to fetch charge details');
    }

    const payerAddress = chargeData.data.payer_addresses[0];
    if (!payerAddress) {
      throw new Error('No payer address found for this charge');
    }

    // Initialize provider and wallet
    const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

    // USDC contract interface (minimal for transfer)
    const usdcInterface = new ethers.Interface([
      'function transfer(address to, uint256 amount) returns (bool)'
    ]);

    // Create contract instance
    const usdcContract = new ethers.Contract(USDC_ADDRESS, usdcInterface, wallet);

    // Send refund transaction
    const tx = await usdcContract.transfer(payerAddress, REFUND_AMOUNT);
    await tx.wait();

    return NextResponse.json({
      message: 'Refund processed successfully! 🎉',
      transactionHash: tx.hash,
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