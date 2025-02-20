'use client';

import { useState } from 'react';
import { Checkout, CheckoutStatus, type LifecycleStatus } from '@coinbase/onchainkit/checkout';
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownLink,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from '@coinbase/onchainkit/identity';
import { CheckoutButton } from '@coinbase/onchainkit/checkout';
import { ethers } from 'ethers';

interface TimelineEvent {
  status: string;
  time: string;
  payment?: {
    transaction: {
      hash: string;
      network: string;
      value: string;
      from: string;
    };
  };
}

interface ChargeData {
  data: {
    timeline: TimelineEvent[];
  };
}

const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // USDC on Base
const REFUND_AMOUNT = '1000000'; // 1 USDC (6 decimals)

export default function App() {
  const [message, setMessage] = useState('');
  const [currentChargeId, setCurrentChargeId] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refundData, setRefundData] = useState<{ transactionHash?: string; amount?: string } | null>(null);

  const handleRefundRequest = async () => {
    setIsLoading(true);
    setMessage('');
    setRefundData(null);

    try {
      // Get charge details from our API endpoint
      const chargeResponse = await fetch('/api/charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chargeId: currentChargeId }),
      });

      if (!chargeResponse.ok) {
        throw new Error(`Failed to fetch charge: ${chargeResponse.status}`);
      }

      const rawData = await chargeResponse.json();
      console.log('Raw API response:', rawData);

      if (!rawData.data?.timeline) {
        throw new Error('Invalid charge data structure');
      }

      const chargeData = rawData as ChargeData;
      console.log('Charge timeline:', chargeData.data.timeline);

      // Find the payment event and get the payer's address
      const paymentEvent = chargeData.data.timeline.find(event => 
        event.status === 'PENDING' && event.payment
      );

      console.log('Payment event:', paymentEvent);

      if (!paymentEvent?.payment?.transaction?.from) {
        throw new Error('No payment transaction found for this charge');
      }

      const payerAddress = paymentEvent.payment.transaction.from;
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

      setMessage('Refund sent successfully! 🎉');
      setRefundData({
        transactionHash: receipt.hash,
        amount: '1 USDC'
      });
    } catch (error) {
      console.error('Refund error:', error);
      setMessage(error instanceof Error ? error.message : 'Failed to process refund');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckoutStatus = (status: LifecycleStatus) => {
    const { statusName, statusData } = status;
    
    switch (statusName) {
      case 'success':
        setCurrentChargeId(statusData.chargeId);
        setCurrentStatus('COMPLETED');
        break;
      case 'pending':
        if ('chargeId' in statusData) {
          setCurrentChargeId(statusData.chargeId);
          setCurrentStatus('PENDING');
        }
        break;
      case 'error':
        setMessage('Transaction failed. Please try again.');
        break;
      default:
        // Handle init state
        break;
    }
  };

  const handleCancelTrial = () => {
    setShowRefundForm(true);
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0A2463]/50 via-background to-background"></div>
      <div className="fixed inset-0 bg-grid-pattern opacity-10"></div>

      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/75 border-b border-[var(--neon-blue)]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)]">
              QUANTUM AI ACCESS
            </h1>
            <div className="wallet-container">
              <Wallet>
                <ConnectWallet>
                  <Avatar className="h-6 w-6" />
                  <Name />
                </ConnectWallet>
                <WalletDropdown>
                  <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                    <Avatar />
                    <Name />
                    <Address />
                    <EthBalance />
                  </Identity>
                  <WalletDropdownLink
                    icon="wallet"
                    href="https://keys.coinbase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Wallet
                  </WalletDropdownLink>
                  <WalletDropdownDisconnect />
                </WalletDropdown>
              </Wallet>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 relative">
        <div className="space-y-8">
          {/* Service Description */}
          <section className="cyber-panel p-8">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)]">
                48-Hour Quantum AI Trial Access
              </h2>
              <div className="space-y-2 text-[var(--foreground)]/80">
                <p>Experience next-generation AI capabilities with our trial package:</p>
                <ul className="list-none space-y-2">
                  <li>✦ 100,000 API calls included</li>
                  <li>✦ Access to all AI models</li>
                  <li>✦ Real-time response generation</li>
                  <li>✦ Full money-back guarantee</li>
                </ul>
              </div>
            </div>
            
            {!currentChargeId ? (
              <div className="flex justify-center mb-8">
                <Checkout 
                  productId="e5efeff0-ab86-4eae-8d5c-4906f69a4ca9"
                  onStatus={handleCheckoutStatus}
                >
                  <CheckoutButton coinbaseBranded text="Start Trial - 1 USDC" />
                  <CheckoutStatus />
                </Checkout>
              </div>
            ) : !showRefundForm ? (
              <div className="cyber-panel p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-[var(--neon-blue)]">
                    Active Trial Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[var(--neon-purple)]">Transaction ID:</span>
                      <code className="block mt-1 bg-background/50 px-2 py-1 rounded border border-[var(--neon-blue)]/20">
                        {currentChargeId}
                      </code>
                    </div>
                    <div>
                      <span className="text-[var(--neon-purple)]">Status:</span>
                      <span className="block mt-1 capitalize">{currentStatus}</span>
                    </div>
                    <div>
                      <span className="text-[var(--neon-purple)]">Time Remaining:</span>
                      <span className="block mt-1">47:59:59</span>
                    </div>
                    <div>
                      <span className="text-[var(--neon-purple)]">API Calls:</span>
                      <span className="block mt-1">100,000 remaining</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={handleCancelTrial}
                    className="cyber-button w-1/2 py-3 px-4 rounded-lg font-bold"
                  >
                    ⚡ Cancel Trial
                  </button>
                  <a 
                    href="/api-docs" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cyber-button-secondary w-1/2 py-3 px-4 rounded-lg font-bold text-center"
                  >
                    View API Docs
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-[var(--neon-purple)] mb-2">
                    Trial Cancellation
                  </h3>
                  <p className="text-[var(--foreground)]/80">
                    Are you sure you want to cancel your trial and request a refund?
                  </p>
                  <div className="mt-4">
                    <code className="block mt-1 bg-background/50 px-4 py-2 rounded border border-[var(--neon-blue)]/20">
                      Transaction ID: {currentChargeId}
                    </code>
                  </div>
                  <div className="mt-6 space-y-4">
                    <button
                      onClick={handleRefundRequest}
                      disabled={isLoading}
                      className="w-full cyber-button px-6 py-3 rounded-lg font-bold"
                    >
                      {isLoading ? '⚡ Processing...' : '⚡ Confirm Cancellation & Refund'}
                    </button>
                    <button
                      onClick={() => setShowRefundForm(false)}
                      disabled={isLoading}
                      className="w-full cyber-button-secondary px-6 py-3 rounded-lg font-bold"
                    >
                      ← Back to Trial Details
                    </button>
                  </div>
                  {message && (
                    <div className="message-box mt-6 p-6 text-center space-y-4">
                      <div className="font-bold">{message}</div>
                      {refundData?.transactionHash && (
                        <div className="space-y-3">
                          <div className="text-sm">
                            <a 
                              href={`https://basescan.org/tx/${refundData.transactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[var(--neon-blue)] hover:text-[var(--neon-purple)] transition-colors"
                            >
                              View Refund Transaction ↗
                            </a>
                          </div>
                          {refundData.amount && (
                            <div className="text-sm text-[var(--cyber-green)]">
                              Amount: {refundData.amount} USDC
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
