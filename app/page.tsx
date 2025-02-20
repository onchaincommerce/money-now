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

export default function App() {
  const [message, setMessage] = useState('');
  const [currentChargeId, setCurrentChargeId] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [showRefundForm, setShowRefundForm] = useState(false);

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
    setMessage('To request a refund, please contact support with your transaction ID.');
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
                    {message}
                  </p>
                  <div className="mt-4">
                    <code className="block mt-1 bg-background/50 px-4 py-2 rounded border border-[var(--neon-blue)]/20">
                      Transaction ID: {currentChargeId}
                    </code>
                  </div>
                  <button
                    onClick={() => setShowRefundForm(false)}
                    className="mt-6 cyber-button px-6 py-2 rounded-lg font-bold"
                  >
                    ← Back to Trial Details
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
