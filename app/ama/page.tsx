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
    username: neynarAuthor.username,
    fname: neynarAuthor.username,
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
    // Make single API call for main cast
    const mainCastResponse = await neynarClient.lookupCastByUrl(
      searchParams['url'] as string,
    )
    const mainCast = mainCastResponse.result.cast

    // Use the result for thread fetch
    const threadResponse = await neynarClient.fetchThread(mainCast.thread_hash)

    const amaUser = transformNeynarAuthor(
      mainCast.mentioned_profiles?.[0] || mainCast.author,
    )
    const userAvatar = amaUser.avatar_url
    const casts = threadResponse.result.casts.map(transformNeynarCast)

    const answersByParentHash = new Map(
      casts
        .filter((cast) => cast.author.fid === amaUser.fid && cast.parent_hash)
        .map((answer) => [answer.parent_hash, answer]),
    )

    const qaThreads = casts
      .filter((cast) => !cast.parent_hash && cast.hash !== mainCast.hash)
      .map((question) => ({
        question,
        answer: answersByParentHash.get(question.hash),
        timestamp: new Date(question.timestamp).getTime(),
      }))
      .sort((a, b) => a.timestamp - b.timestamp)

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

        {/* Q&A Section */}
        <div className="space-y-8">
          {qaThreads.map(({ question, answer }) => (
            <QAItem
              key={question.hash}
              question={question}
              answer={answer}
              amaUser={amaUser}
              userAvatar={userAvatar}
            />
          ))}
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
