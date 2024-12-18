import { useEffect, useState } from 'react'
import type { NeynarUser } from '../types'

export function useNeynarUser() {
  const [neynarUser, setNeynarUser] = useState<NeynarUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadNeynarUser = () => {
      try {
        const signerUUID = localStorage.getItem('neynar_signer_uuid')
        const userData = localStorage.getItem('neynar_user_data')

        if (signerUUID && userData) {
          const parsedUserData = JSON.parse(userData)
          setNeynarUser({
            signer_uuid: signerUUID,
            fid: parsedUserData.fid,
            user: {
              username: parsedUserData.username,
              displayName: parsedUserData.display_name,
              pfp: {
                url: parsedUserData.pfp_url || parsedUserData.avatar_url || '',
              },
            },
          })
        } else {
          setNeynarUser(null)
        }
      } catch (error) {
        console.error('Error loading Neynar user:', error)
        setNeynarUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    // Load initial state
    loadNeynarUser()

    // Listen for storage changes
    const handleStorageChange = (event: StorageEvent) => {
      if (
        event.key === 'neynar_signer_uuid' ||
        event.key === 'neynar_user_data'
      ) {
        loadNeynarUser()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return {
    neynarUser,
    isLoading,
    isConnected: !!neynarUser,
  }
}
