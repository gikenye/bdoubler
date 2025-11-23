'use client';

import dynamic from 'next/dynamic';
import type { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { AuthKitProvider } from '@farcaster/auth-kit';
import { MiniAppProvider } from '@neynar/react';
import { HuddleClient, HuddleProvider } from '@huddle01/react';
import { SafeFarcasterSolanaProvider } from '~/components/providers/SafeFarcasterSolanaProvider';
import { ANALYTICS_ENABLED, RETURN_URL } from '~/lib/constants';

const huddleClient = new HuddleClient({
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
  options: {
    activeSpeakers: {
      size: 12,
    },
  },
});

const WagmiProvider = dynamic(
  () => import('~/components/providers/WagmiProvider'),
  {
    ssr: false,
  }
);

export function Providers({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  const solanaEndpoint =
    process.env.SOLANA_RPC_ENDPOINT || 'https://solana-rpc.publicnode.com';
  return (
    <SessionProvider session={session}>
      <WagmiProvider>
        <HuddleProvider client={huddleClient}>
          <MiniAppProvider
            analyticsEnabled={ANALYTICS_ENABLED}
            backButtonEnabled={true}
            returnUrl={RETURN_URL}
          >
            <SafeFarcasterSolanaProvider endpoint={solanaEndpoint}>
              <AuthKitProvider config={{}}>
                {children}
              </AuthKitProvider>
            </SafeFarcasterSolanaProvider>
          </MiniAppProvider>
        </HuddleProvider>
      </WagmiProvider>
    </SessionProvider>
  );
}
