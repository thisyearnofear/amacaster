'use client'

import { useEffect, useState } from 'react'
import { getNeynarClient } from '@/lib/neynarClient'
import DraggableQASection from '../components/DraggableQASection'
import type { Cast, Author, NeynarCast } from '../types'
import SafeImage from '../components/SafeImage'

const transformNeynarAuthor = (neynarAuthor: any): Author => {
  console.log('Raw author data:', neynarAuthor)

  // Handle different avatar URL structures
  const avatarUrl =
    neynarAuthor.avatar_url ||
    neynarAuthor.pfp_url ||
    (neynarAuthor.pfp && neynarAuthor.pfp.url) ||
    '/default-avatar.png'

  return {
    fid: neynarAuthor.fid,
    username: neynarAuthor.username || '',
    fname: neynarAuthor.fname || neynarAuthor.username || '',
    display_name: neynarAuthor.display_name,
    avatar_url: avatarUrl,
    custody_address: neynarAuthor.custody_address || '',
  }
}

const transformNeynarCast = (neynarCast: NeynarCast): Cast => ({
  hash: neynarCast.hash,
  parent_hash: neynarCast.parent_hash,
  author: transformNeynarAuthor(neynarCast.author),
  text: neynarCast.text,
  timestamp: neynarCast.timestamp,
  reactions: neynarCast.reactions,
})

export default function AMA({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mainCast, setMainCast] = useState<any>(null)
  const [secondTier, setSecondTier] = useState<Cast[]>([])
  const [thirdTier, setThirdTier] = useState<Cast[]>([])
  const [amaUser, setAmaUser] = useState<Author | null>(null)

  const isAdmin = process.env.NEXT_PUBLIC_ADMIN_MODE === 'true'

  useEffect(() => {
    async function fetchData() {
      try {
        const url = searchParams['url']
        if (!url || typeof url !== 'string') {
          setError('Please provide a valid Warpcast URL.')
          return
        }

        const neynarClient = getNeynarClient()

        // Make single API call for main cast
        const mainCastResponse = await neynarClient.lookupCastByUrl(url)
        if (!mainCastResponse?.result?.cast) {
          throw new Error('Failed to fetch main cast')
        }
        const fetchedMainCast = mainCastResponse.result.cast
        setMainCast(fetchedMainCast)

        // Use the result for thread fetch
        const threadResponse = await neynarClient.fetchThread(
          fetchedMainCast.thread_hash,
        )
        if (!threadResponse?.result?.casts) {
          throw new Error('Failed to fetch thread')
        }

        const fetchedAmaUser = transformNeynarAuthor(
          fetchedMainCast.mentioned_profiles?.[0] || fetchedMainCast.author,
        )
        setAmaUser(fetchedAmaUser)

        const casts = threadResponse.result.casts
          .filter((cast) => cast && typeof cast === 'object')
          .map(transformNeynarCast)

        // Separate responses into second and third tier based on AMA user
        const secondTierResponses: Cast[] = []
        const thirdTierResponses: Cast[] = []

        casts.forEach((cast) => {
          if (cast.hash === fetchedMainCast.hash) return // Skip the main cast

          // Check if the cast is from the AMA user by comparing both username and fname
          const isFromAMAUser =
            (fetchedAmaUser.username &&
              cast.author.username === fetchedAmaUser.username) ||
            (fetchedAmaUser.fname && cast.author.fname === fetchedAmaUser.fname)

          if (isFromAMAUser) {
            thirdTierResponses.push(cast)
          } else if (!cast.parent_hash) {
            secondTierResponses.push(cast)
          }
        })

        // Sort by timestamp
        setSecondTier(
          secondTierResponses.sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
          ),
        )
        setThirdTier(
          thirdTierResponses.sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
          ),
        )
      } catch (err) {
        console.error('Error loading AMA:', err)
        setError('Error loading AMA. Please try refreshing the page.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [searchParams])

  if (error) {
    return (
      <div className="ama-container">
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      </div>
    )
  }

  if (isLoading || !mainCast || !amaUser) {
    return (
      <div className="ama-container">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="ama-container">
      {/* AMA Header */}
      <div className="ama-header">
        <div className="flex items-center gap-4 mb-6">
          <SafeImage
            src={amaUser.avatar_url}
            alt={amaUser.display_name}
            width={64}
            height={64}
            className="rounded-full"
          />
          <div>
            <h1 className="text-2xl font-bold">{amaUser.display_name}</h1>
            <p className="text-gray-600">@{amaUser.username}</p>
          </div>
        </div>
        <div className="text-lg mb-6 p-4 bg-gray-50 rounded-lg">
          {mainCast.text}
        </div>
      </div>

      {/* Q&A Section */}
      <DraggableQASection
        secondTier={secondTier}
        thirdTier={thirdTier}
        isAdmin={isAdmin}
        onOrderChange={async (newSecondTier, newThirdTier) => {
          if (!isAdmin) return

          try {
            const response = await fetch('/api/save-order', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                castHash: mainCast.hash,
                order: {
                  secondTier: newSecondTier.map((cast) => cast.hash),
                  thirdTier: newThirdTier.map((cast) => cast.hash),
                },
              }),
            })

            if (!response.ok) {
              console.error('Failed to save order')
            }
          } catch (error) {
            console.error('Error saving order:', error)
          }
        }}
      />
    </div>
  )
}
