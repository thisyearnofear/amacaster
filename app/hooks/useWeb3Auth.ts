import { useAccount, useSignMessage } from 'wagmi'
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export function useWeb3Auth() {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signIn = useCallback(async () => {
    if (!address || !supabase) return null
    setIsLoading(true)
    setError(null)

    try {
      // Check if user exists
      const { data: user } = await supabase
        .from('users')
        .select()
        .eq('wallet_address', address.toLowerCase())
        .single()

      if (!user) {
        // Create new user if doesn't exist
        const { error: insertError } = await supabase.from('users').insert({
          wallet_address: address.toLowerCase(),
          created_at: new Date().toISOString(),
        })

        if (insertError) throw insertError
      }

      // Generate a nonce with timestamp to prevent replay attacks
      const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`

      // Sign the nonce with the wallet
      const signature = await signMessageAsync({
        message: `Sign this message to authenticate with Amacaster.\n\nNonce: ${nonce}`,
      })

      // Create a JWT token using Supabase's custom JWT
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: `${address.toLowerCase()}@wallet.local`,
          password: signature,
        })

      if (authError) throw authError

      return authData
    } catch (error) {
      console.error('Error signing in:', error)
      setError(error instanceof Error ? error.message : 'Failed to sign in')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [address, signMessageAsync])

  const signOut = useCallback(async () => {
    if (!supabase) return
    setError(null)
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
      setError(error instanceof Error ? error.message : 'Failed to sign out')
    }
  }, [])

  // Auto sign-in when wallet is connected
  useEffect(() => {
    if (isConnected && address && supabase) {
      signIn()
    }
  }, [isConnected, address, signIn])

  return {
    signIn,
    signOut,
    isConnected,
    address,
    isLoading,
    error,
  }
}
