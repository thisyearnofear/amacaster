'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { SignInWithNeynar } from './SignInWithNeynar'

export function AuthContainer() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
      <div className="w-full md:w-auto">
        <ConnectButton />
      </div>
      <div className="w-full md:w-auto">
        <SignInWithNeynar />
      </div>
    </div>
  )
}
