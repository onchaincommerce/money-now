'use client';

import { base } from 'wagmi/chains';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import type { ReactNode } from 'react';

export function Providers(props: { children: ReactNode }) {
  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={base}
      config={{ 
        appearance: { 
          mode: 'auto',
          name: 'I WANT MY MONEY NOW! 🤑',
          logo: '💰', // You can replace this with an actual logo URL
        }
      }}
    >
      {props.children}
    </OnchainKitProvider>
  );
}

