'use client'

import { WalletConnect } from './WalletConnect'
import { SignInWithNeynar } from './SignInWithNeynar'

export function AuthContainer() {
  return (
    <div className="auth-container">
      <div className="flex items-center gap-6 flex-wrap justify-end">
        <div className="flex-grow md:flex-grow-0">
          <SignInWithNeynar />
        </div>
        <div className="auth-divider hidden md:block" />
        <div className="flex-shrink-0">
          <WalletConnect />
        </div>
      </div>
    </div>
  )
}
