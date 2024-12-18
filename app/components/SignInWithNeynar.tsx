'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface SignInWithNeynarProps {
  onSignInSuccess?: (data: {
    signer_uuid: string
    fid: number
    user: any
  }) => void
}

interface NeynarUser {
  signer_uuid: string
  fid: number
  user: {
    username: string
    displayName: string
    pfp: {
      url: string
    }
  }
}

declare global {
  interface Window {
    onSignInSuccess?: (data: any) => void
  }
}

export function SignInWithNeynar({ onSignInSuccess }: SignInWithNeynarProps) {
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<NeynarUser | null>(null)

  useEffect(() => {
    // Try to get stored user data
    const storedUser = localStorage.getItem('neynar_user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      onSignInSuccess?.(userData)
    }

    const clientId = process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID
    if (!clientId) {
      setError('Neynar Client ID is not configured')
      return
    }

    // Define the callback function
    window.onSignInSuccess = (data: any) => {
      console.log('Sign-in success with data:', data)
      if (data.error) {
        setError(data.error)
        return
      }
      // Store user data in localStorage
      localStorage.setItem('neynar_user', JSON.stringify(data))
      setUser(data)
      onSignInSuccess?.(data)
    }

    // Load the SIWN script
    const script = document.createElement('script')
    script.src = 'https://neynarxyz.github.io/siwn/raw/1.2.0/index.js'
    script.async = true
    script.onerror = () => {
      setError('Failed to load Neynar sign-in script')
    }
    document.body.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
      if (window.onSignInSuccess) {
        window.onSignInSuccess = undefined
      }
    }
  }, [onSignInSuccess])

  const handleSignOut = () => {
    localStorage.removeItem('neynar_user')
    setUser(null)
  }

  if (error) {
    return <div className="text-red-500 text-sm mb-4">Error: {error}</div>
  }

  if (user) {
    return (
      <div className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Image
            src={user.user.pfp?.url || '/default-avatar.png'}
            alt={user.user.displayName}
            width={24}
            height={24}
            className="rounded-full"
            unoptimized={(user.user.pfp?.url || '').startsWith('data:')}
          />
          <span>@{user.user.username}</span>
        </div>
        <button
          onClick={handleSignOut}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <div
      className="neynar_signin inline-flex"
      data-client_id={process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID}
      data-success-callback="onSignInSuccess"
      data-theme="dark"
      data-variant="farcaster"
    />
  )
}
