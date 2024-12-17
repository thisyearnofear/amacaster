'use client'

import '@rainbow-me/rainbowkit/styles.css'
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { mainnet, optimism, optimismSepolia } from 'viem/chains'
import { useState } from 'react'

// Ensure we have a projectId, even in development
const projectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ||
  'development-only-project-id'

const config = getDefaultConfig({
  appName: 'Amacaster',
  projectId,
  chains: [optimismSepolia, optimism, mainnet],
  ssr: true,
})

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      }),
  )

  // If no valid projectId is provided in production, render without wallet connection
  if (
    process.env.NODE_ENV === 'production' &&
    (!projectId || projectId === 'development-only-project-id')
  ) {
    return <>{children}</>
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact" initialChain={optimismSepolia}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
