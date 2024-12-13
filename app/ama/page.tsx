import { Metadata } from 'next'
import neynarClient from '@/lib/neynarClient'
import QAItem from '../components/QAItem'
import type { Cast, Author, NeynarCast } from '../types'
import SafeImage from '../components/SafeImage'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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

export default async function AMA({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  try {
    const url = searchParams['url']
    if (!url || typeof url !== 'string') {
      return (
        <div className="ama-container">
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">
            Please provide a valid Warpcast URL.
          </div>
        </div>
      )
    }

    // Make single API call for main cast
    const mainCastResponse = await neynarClient.lookupCastByUrl(url)
    if (!mainCastResponse?.result?.cast) {
      throw new Error('Failed to fetch main cast')
    }
    const mainCast = mainCastResponse.result.cast

    // Get mentioned usernames from the initial cast
    const mentionedUsernames = mainCast.text
      .split(' ')
      .filter((word) => word.startsWith('@'))
      .map((mention) => mention.substring(1).toLowerCase())

    // Use the result for thread fetch
    const threadResponse = await neynarClient.fetchThread(mainCast.thread_hash)
    if (!threadResponse?.result?.casts) {
      throw new Error('Failed to fetch thread')
    }

    const amaUser = transformNeynarAuthor(
      mainCast.mentioned_profiles?.[0] || mainCast.author,
    )
    const userAvatar = amaUser.avatar_url || '/default-avatar.png'
    const casts = threadResponse.result.casts
      .filter((cast) => cast && typeof cast === 'object')
      .map(transformNeynarCast)

    // Separate responses into second and third tier based on AMA user
    const secondTierResponses = new Map()
    const thirdTierResponses = new Map()

    casts.forEach((cast) => {
      if (cast.hash === mainCast.hash) return // Skip the main cast

      // Check if the cast is from the AMA user by comparing both username and fname
      const isFromAMAUser =
        (amaUser.username && cast.author.username === amaUser.username) ||
        (amaUser.fname && cast.author.fname === amaUser.fname)

      if (isFromAMAUser) {
        thirdTierResponses.set(cast.hash, cast)
      } else if (!cast.parent_hash) {
        secondTierResponses.set(cast.hash, cast)
      }
    })

    // Convert to arrays and sort by timestamp
    const secondTier = Array.from(secondTierResponses.values()).sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    )

    const thirdTier = Array.from(thirdTierResponses.values()).sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    )

    return (
      <div className="ama-container">
        {/* AMA Header */}
        <div className="ama-header">
          <div className="flex items-center gap-4 mb-6">
            <SafeImage
              src={userAvatar}
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

        {/* Two Column Layout for Second and Third Tier */}
        <div className="flex gap-4">
          {/* Second Tier (Left Column) */}
          <div className="flex-1 space-y-4">
            <h2 className="text-lg font-medium text-gray-700">Questions</h2>
            {secondTier.map((cast) => (
              <div
                key={cast.hash}
                className="message-bubble message-bubble-left"
              >
                <div className="message-metadata mb-2">
                  <span className="font-medium">
                    {cast.author.display_name}
                  </span>
                  <span className="text-gray-500">@{cast.author.fname}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500 text-sm">
                    {new Date(cast.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="question-text">{cast.text}</p>
              </div>
            ))}
          </div>

          {/* Third Tier (Right Column) */}
          <div className="flex-1 space-y-4">
            <h2 className="text-lg font-medium text-purple-700">Answers</h2>
            {thirdTier.map((cast) => (
              <div
                key={cast.hash}
                className="message-bubble message-bubble-right"
              >
                <div className="message-metadata mb-2 justify-end">
                  <span className="font-medium text-purple-900">
                    {cast.author.display_name}
                  </span>
                  <span className="text-purple-700">@{cast.author.fname}</span>
                  <span className="text-purple-400">•</span>
                  <span className="text-purple-700 text-sm">
                    {new Date(cast.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="answer-text text-purple-900">{cast.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading AMA:', error)
    return (
      <div className="ama-container">
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          Error loading AMA. Please try refreshing the page.
        </div>
      </div>
    )
  }
}
