'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

interface ENSData {
  ens_primary?: string
  avatar?: string
}

async function resolveENSNameFallback(
  address: string,
): Promise<ENSData | null> {
  try {
    const response = await fetch(`https://api.ensdata.net/${address}`)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.json()
    return {
      ens_primary: data.ens_primary || null,
      avatar: data.avatar || null,
    }
  } catch (error) {
    console.error('Error resolving ENS name using ENS Data API:', error)
    return null
  }
}

export function WalletConnect() {
  const { address } = useAccount()
  const [ensName, setEnsName] = useState<string | null>(null)

  useEffect(() => {
    async function fetchENSData() {
      if (!address) return

      try {
        // Try fallback ENS resolution
        const ensData = await resolveENSNameFallback(address)
        if (ensData) {
          setEnsName(ensData.ens_primary || null)
        }
      } catch (error) {
        console.error('Error resolving ENS data:', error)
      }
    }

    fetchENSData()
  }, [address])

  return (
    <ConnectButton
      showBalance={false}
      chainStatus="icon"
      accountStatus={{
        smallScreen: 'avatar',
        largeScreen: 'full',
      }}
    />
  )
}
