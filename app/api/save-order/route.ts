import { NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'
import {
  createOrUpdateAMASession,
  saveQAPairs,
  getAMASession,
} from '../../../lib/supabaseClient'

export async function POST(request: Request) {
  try {
    const { castHash, order } = await request.json()

    // If Supabase is configured, use it
    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      // Get or create AMA session
      const session = await getAMASession(castHash)
      if (!session) {
        // You might want to get these values from the authenticated user context
        const newSession = await createOrUpdateAMASession(
          castHash,
          'temp_host_fid', // Replace with actual host FID
          'Untitled AMA', // Replace with actual title
        )
        if (!newSession) {
          return NextResponse.json(
            { error: 'Failed to create AMA session' },
            { status: 500 },
          )
        }
      }

      // Save QA pairs with their positions
      const pairs = order.secondTier.map(
        (questionHash: string, index: number) => ({
          questionHash,
          answerHash: order.thirdTier[index],
          position: index,
        }),
      )

      const success = await saveQAPairs(session?.id || '', pairs)
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to save QA pairs' },
          { status: 500 },
        )
      }
    }

    // For now, just return success since we're not using Supabase yet
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in save-order API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const castHash = url.searchParams.get('castHash')

    if (!castHash) {
      return NextResponse.json(
        { error: 'Cast hash is required' },
        { status: 400 },
      )
    }

    // For now, just return null order since we're not using storage yet
    return NextResponse.json({ order: null })
  } catch (error) {
    console.error('Error reading order:', error)
    return NextResponse.json({ error: 'Failed to read order' }, { status: 500 })
  }
}
