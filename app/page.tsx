'use client'

import Link from 'next/link'
import { useState } from 'react'
import IconImage from './components/IconImage'
import { SignInWithNeynar } from './components/SignInWithNeynar'
import { TestnetInstructions } from './components/TestnetInstructions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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

export default function Home() {
  const [warpcastURL, setWarpcastURL] = useState('')
  const [neynarUser, setNeynarUser] = useState<NeynarUser | null>(null)

  const handleNeynarSignIn = (data: NeynarUser) => {
    setNeynarUser(data)
    localStorage.setItem('neynar_signer_uuid', data.signer_uuid)
  }

  const hostLinks = [
    {
      icon: 'ethereum.svg',
      name: 'Vitalik Buterin',
      url: '/ama?url=https://warpcast.com/dwr.eth/0x390ae86a',
    },
    {
      icon: 'coinbase.svg',
      name: 'Brian Armstrong',
      url: '/ama?url=https://warpcast.com/dwr.eth/0x7735946a',
    },
    {
      icon: 'USV.svg',
      name: 'Fred Wilson',
      url: '/ama?url=https://warpcast.com/dwr.eth/0x87e91802',
    },
    {
      icon: 'y-combinator.svg',
      name: 'Garry Tan',
      url: '/ama?url=https://warpcast.com/dwr.eth/0xe4ec97c9',
    },
    {
      icon: 'ebay.svg',
      name: 'Chris Dixon',
      url: '/ama?url=https://warpcast.com/dwr.eth/0x231c3b60',
    },
    {
      icon: 'Twitter.svg',
      name: 'Elad Gil',
      url: '/ama?url=https://warpcast.com/dwr.eth/0xd39ac80f',
    },
    {
      icon: 'a16z.svg',
      name: 'Marc Andreessen',
      url: '/ama?url=https://warpcast.com/pmarca/0x5901e102',
    },
  ]

  const communityLinks = [
    {
      icon: 'paragraph.svg',
      name: '@colin',
      url: '/ama?url=https://warpcast.com/yb/0x8bac9cbb',
    },
    {
      icon: 'horsefacts.svg',
      name: 'horsefacts',
      url: '/ama?url=https://warpcast.com/yb/0x7d5219e5',
    },
    {
      icon: 'purple.svg',
      name: '@dwr',
      url: '/ama?url=https://warpcast.com/dwr.eth/0xf41e24f1',
    },
    {
      icon: 'perl.svg',
      name: '@ace',
      url: '/ama?url=https://warpcast.com/jam/0x794f4a4e',
    },
    {
      icon: 'mod.svg',
      name: '@df',
      url: '/ama?url=https://warpcast.com/jam/0xe195a8e2',
    },
    {
      icon: 'fxhash.svg',
      name: '@qualv',
      url: '/ama?url=https://warpcast.com/kugusha.eth/0xa404739c',
    },
    {
      icon: 'bountycaster.svg',
      name: '@linda',
      url: '/ama?url=https://warpcast.com/yb/0x803cf956',
    },
  ]

  const socialLinks = [
    {
      icon: 'twitter.svg',
      name: 'Twitter',
      url: 'https://twitter.com/papajimjams',
    },
    {
      icon: 'farcaster.svg',
      name: 'farcaster',
      url: 'https://warpcast.com/papa',
    },
    {
      icon: 'paragraph.svg',
      name: 'paragraph',
      url: 'https://paragraph.xyz/@papajams.eth',
    },
  ]

  return (
    <div className="flex flex-col items-center py-12 w-full text-center">
      <h2 className="text-4xl font-bold py-6">AMACASTER</h2>

      <div className="mb-8">
        {neynarUser ? (
          <div className="text-sm text-gray-600 flex items-center gap-2">
            {neynarUser.user.pfp?.url && (
              <img
                src={neynarUser.user.pfp.url}
                alt={neynarUser.user.username}
                className="w-6 h-6 rounded-full"
              />
            )}
            <span>
              Connected as{' '}
              {neynarUser.user.displayName ||
                `@${neynarUser.user.username}` ||
                `FID: ${neynarUser.fid}`}
            </span>
          </div>
        ) : (
          <SignInWithNeynar onSignInSuccess={handleNeynarSignIn} />
        )}
      </div>

      <h3 className="text-lg mb-2">archive</h3>

      <div className="flex justify-center w-full gap-8 mb-4">
        <div className="flex-1 max-w-md">
          <h3 className="mb-2 text-center">Hosted by DWR</h3>
          <ul className="flex flex-col items-center">
            {hostLinks.map((link) => (
              <li
                key={link.url}
                className="py-1 text-center flex items-center justify-center"
              >
                <IconImage
                  src={`https://res.cloudinary.com/dsneebaw0/image/upload/v1708031540/${link.icon}`}
                  alt={link.name}
                  className="icon-size mr-1"
                />
                <Link href={link.url} className="underline">
                  {' '}
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1 max-w-md">
          <h3 className="mb-2 text-center">Hosted by Community</h3>
          <ul className="flex flex-col items-center">
            {communityLinks.map((link) => (
              <li
                key={link.url}
                className="py-1 text-center flex items-center justify-center"
              >
                <IconImage
                  src={`https://res.cloudinary.com/dsneebaw0/image/upload/v1708031540/${link.icon}`}
                  alt={link.name}
                  className="icon-size mr-2"
                />
                <Link href={link.url} className="underline">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="max-w-2xl mx-auto my-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="mb-3 text-2xl">🎯</div>
            <h4 className="font-medium mb-2">Crowdsource truth</h4>
            <p className="text-sm text-gray-600">
              Match questions with answers from farcaster AMA&apos;s, predict
              rankings of question usefulness
            </p>
          </div>
          <div className="text-center">
            <div className="mb-3 text-2xl">⛓️</div>
            <h4 className="font-medium mb-2">Submit On-chain</h4>
            <p className="text-sm text-gray-600">
              Matches, useful questions, predictions & contributions are
              recorded on OP & the best get POAPs
            </p>
          </div>
          <div className="text-center">
            <div className="mb-3 text-2xl">🏆</div>
            <h4 className="font-medium mb-2">Critical Mass</h4>
            <p className="text-sm text-gray-600">
              Top 20 most useful q&a pairs can be minted as an NFT with proceeds
              split amongst POAP holders
            </p>
          </div>
        </div>
      </div>

      <TestnetInstructions />

      <div>
        <h3 className="text-lg mb-2">try</h3>
        <div className="flex flex-row justify-center">
          <input
            value={warpcastURL}
            onChange={(e) => setWarpcastURL(e.target.value)}
            className="border rounded-md mr-2 px-2 py-2 w-96 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Insert Warpcast Link..."
          />
          <Link
            href={`/ama/?url=${warpcastURL}`}
            className="bg-purple-500 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded"
          >
            View
          </Link>
        </div>

        <div className="text-center mt-20">
          <h3 className="text-lg mb-2">Lore</h3>
          <p>
            inverse AMA{' '}
            <a
              href="https://warpcast.com/samantha/0xc9010d04"
              className="underline"
            >
              @Samantha
            </a>
            <br />
            wordcloud collection{' '}
            <a
              href="https://warpcast.com/ghostlinkz.eth/0x58ce6ae7"
              className="underline"
            >
              @ghostlinkz
            </a>
            <br />
            short story{' '}
            <a
              href="https://www.blabla.lol/stories/fc-ama-with-garry-tan"
              className="underline"
            >
              @jackjack.eth
            </a>
            <br />
            challenge set by{' '}
            <a
              href="https://warpcast.com/dwr.eth/0xa04f0f2c"
              className="underline"
            >
              @dwr
            </a>{' '}
            (
            <a
              href="https://warpcast.com/dwr.eth/0x6186cf9b"
              className="underline"
            >
              his ama
            </a>
            )
            <br />
            forked from{' '}
            <a
              href="https://github.com/wojtekwtf/fc-ama-formatter"
              className="underline"
            >
              @woj
            </a>{' '}
            and{' '}
            <a
              href="https://warpcast.com/alvesjtiago.eth"
              className="underline"
            >
              @tiago
            </a>
            <br />
            coding assist{' '}
            <a href="https://warpcast.com/carter" className="underline">
              @carter
            </a>
            <br />
            <br />
            built by @papa
          </p>
          <div className="flex justify-center gap-4 mt-8">
            {socialLinks.map((link) => (
              <a key={link.url} href={link.url}>
                <IconImage
                  src={`https://res.cloudinary.com/dsneebaw0/image/upload/v1708031540/${link.icon}`}
                  alt={link.name}
                  className="icon-size"
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
