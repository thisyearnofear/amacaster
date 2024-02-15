import { ImageResponse } from 'next/og'
import { NextRequest, NextResponse } from 'next/server'

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    api_key: process.env.NEYNAR_API_KEY ?? '',
  },
}

export const runtime = 'edge'

export async function GET(
  request: NextRequest,
  { params }: { params: { hash: string } },
) {
  try {
    const castResponse = await fetch(
      `https://api.neynar.com/v2/farcaster/cast?type=hash&identifier=${params.hash}`,
      options,
    )

    if (!castResponse.ok) {
      throw new Error(`API call failed with status: ${castResponse.status}`)
    }

    const cast = await castResponse.json()

    // Ensure the necessary data is present
    if (!cast || !cast.cast || !cast.cast.text) {
      throw new Error('Required cast data is missing')
    }

    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 40,
            color: 'black',
            background: 'white',
            width: '100%',
            height: '100%',
            padding: '50px 200px',
            textAlign: 'center',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {cast.cast.text}
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    )
  } catch (error) {
    console.error(error)
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 40,
            color: 'white',
            background: 'red',
            width: '100%',
            height: '100%',
            padding: '50px 200px',
            textAlign: 'center',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          Error fetching cast data.
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    )
  }
}
