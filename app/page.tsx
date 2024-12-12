'use client'

import Link from 'next/link'
import { useState } from 'react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function Home() {
  const [warpcastURL, setWarpcastURL] = useState('')

  return (
    <div className="flex flex-col items-center py-12 w-full text-center">
      {/* Heading */}
      <h2 className="text-4xl font-bold py-6">AMACASTER</h2>
      <h3 className="text-xl font-medium py-2">Previously</h3>

      {/* Two-column layout for names */}
      <div className="flex justify-center w-full gap-8 mb-4">
        {/* Column 1 */}
        <div className="flex-1 max-w-md">
          <h3 className="mb-2 text-center">Hosted by DWR</h3>
          <ul className="flex flex-col items-center">
            <li className="py-1 text-center flex items-center justify-center">
              <img
                src="https://res.cloudinary.com/dsneebaw0/image/upload/v1708030863/ethereum.svg"
                alt="Vitalik Buterin"
                className="icon-size mr-0"
              />
              <Link
                href="/ama?url=https://warpcast.com/dwr.eth/0x390ae86a"
                className="underline"
              >
                {' '}
                Vitalik Buterin
              </Link>
            </li>
            <li className="py-1 text-center flex items-center justify-center">
              <img
                src="https://res.cloudinary.com/dsneebaw0/image/upload/v1708031540/coinbase.svg"
                alt="Brian Armstrong"
                className="icon-size mr-1"
              />
              <Link
                href="/ama?url=https://warpcast.com/dwr.eth/0x7735946a"
                className="underline"
              >
                {' '}
                Brian Armstrong
              </Link>
            </li>
            <li className="py-1 text-center flex items-center justify-center">
              <img
                src="https://res.cloudinary.com/dsneebaw0/image/upload/v1708031541/USV.svg"
                alt="Fred Wilson"
                className="icon-size mr-1"
              />
              <Link
                href="/ama?url=https://warpcast.com/dwr.eth/0x87e91802"
                className="underline"
              >
                {' '}
                Fred Wilson
              </Link>
            </li>
            <li className="py-1 text-center flex items-center justify-center">
              <img
                src="https://res.cloudinary.com/dsneebaw0/image/upload/v1708031540/y-combinator.svg"
                alt="Garry Tan"
                className="icon-size mr-1"
              />
              <Link
                href="/ama?url=https://warpcast.com/dwr.eth/0xe4ec97c9"
                className="underline"
              >
                {' '}
                Garry Tan
              </Link>
            </li>
            <li className="py-1 text-center flex items-center justify-center">
              <img
                src="https://res.cloudinary.com/dsneebaw0/image/upload/v1708031541/ebay.svg"
                alt="Chris Dixon"
                className="icon-size mr-1"
              />
              <Link
                href="/ama?url=https://warpcast.com/dwr.eth/0x231c3b60"
                className="underline"
              >
                {' '}
                Chris Dixon
              </Link>
            </li>
            <li className="py-1 text-center flex items-center justify-center">
              <img
                src="https://res.cloudinary.com/dsneebaw0/image/upload/v1708031540/Twitter.svg"
                alt="Elad Gil"
                className="icon-size mr-1"
              />
              <Link
                href="/ama?url=https://warpcast.com/dwr.eth/0xd39ac80f"
                className="underline"
              >
                {' '}
                Elad Gil
              </Link>
            </li>
            <li className="py-1 text-center flex items-center justify-center">
              <img
                src="https://res.cloudinary.com/dsneebaw0/image/upload/v1708031541/a16z.svg"
                alt="Marc Andreessen"
                className="icon-size mr-1"
              />
              <Link
                href="/ama?url=https://warpcast.com/pmarca/0x5901e102"
                className="underline"
              >
                {' '}
                Marc Andreessen
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 2 */}
        <div className="flex-1 max-w-md">
          <h3 className="mb-2 text-center">Hosted by Community</h3>
          <ul className="flex flex-col items-center">
            <li className="py-1 text-center flex items-center justify-center">
              <img
                src="https://res.cloudinary.com/dsneebaw0/image/upload/v1708031541/paragraph.svg"
                alt="@colin"
                className="icon-size mr-2"
              />
              <Link
                href="/ama?url=https://warpcast.com/yb/0x8bac9cbb"
                className="underline"
              >
                @colin
              </Link>
            </li>
            <li className="py-1 text-center flex items-center justify-center">
              <img
                src="https://res.cloudinary.com/dsneebaw0/image/upload/v1708031540/horsefacts.svg"
                alt="horsefacts"
                className="icon-size mr-2"
              />
              <Link
                href={`/ama?url=https://warpcast.com/yb/0x7d5219e5`}
                className="underline"
              >
                horsefacts
              </Link>
            </li>
            <li className="py-1 text-center flex items-center justify-center">
              <img
                src="https://res.cloudinary.com/dsneebaw0/image/upload/v1708031541/purple.svg"
                alt="@dwr"
                className="icon-size mr-2"
              />
              <Link
                href="/ama?url=https://warpcast.com/dwr.eth/0xf41e24f1"
                className="underline"
              >
                @dwr
              </Link>
            </li>
            <li className="py-1 text-center flex items-center justify-center">
              <img
                src="https://res.cloudinary.com/dsneebaw0/image/upload/v1708031541/perl.svg"
                alt="@ace"
                className="icon-size mr-2"
              />
              <Link
                href="/ama?url=https://warpcast.com/jam/0x794f4a4e"
                className="underline"
              >
                @ace
              </Link>
            </li>
            <li className="py-1 text-center flex items-center justify-center">
              <img
                src="https://res.cloudinary.com/dsneebaw0/image/upload/v1708031540/mod.svg"
                alt="@df"
                className="icon-size mr-2"
              />
              <Link
                href={`/ama?url=https://warpcast.com/jam/0xe195a8e2`}
                className="underline"
              >
                @df
              </Link>
            </li>
            <li className="py-1 text-center flex items-center justify-center">
              <img
                src="https://res.cloudinary.com/dsneebaw0/image/upload/v1708031540/fxhash.svg"
                alt="@qualv"
                className="icon-size mr-2"
              />
              <Link
                href="/ama?url=https://warpcast.com/kugusha.eth/0xa404739c"
                className="underline"
              >
                @qualv
              </Link>
            </li>
            <li className="py-1 text-center flex items-center justify-center">
              <img
                src="https://res.cloudinary.com/dsneebaw0/image/upload/v1708031541/bountycaster.svg"
                alt="@linda"
                className="icon-size mr-2"
              />
              <Link
                href="/ama?url=https://warpcast.com/yb/0x803cf956"
                className="underline"
              >
                @linda
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Centered content below */}
      <div>
        <h3 className="text-lg mb-2">Other Past AMAs</h3>
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

        {/* Lore section */}
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
            <br></br>
            built by @papa
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <a href="https://twitter.com/papajimjams">
              <img
                src="https://res.cloudinary.com/dsneebaw0/image/upload/v1708031541/twitter.svg"
                alt="Twitter"
                className="icon-size"
              />
            </a>
            <a href="https://warpcast.com/papa">
              <img
                src="https://res.cloudinary.com/dsneebaw0/image/upload/v1708031540/farcaster.svg"
                alt="farcaster"
                className="icon-size"
              />
            </a>
            <a href="https://paragraph.xyz/@papajams.eth">
              <img
                src="https://res.cloudinary.com/dsneebaw0/image/upload/v1708031541/paragraph.svg"
                alt="paragraph"
                className="icon-size"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
