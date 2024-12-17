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

    const orderPath = path.join(
      process.cwd(),
      'data',
      'orders',
      `${castHash}.json`,
    )

    try {
      const orderData = await fs.readFile(orderPath, 'utf-8')
      return NextResponse.json(JSON.parse(orderData))
    } catch (error) {
      // If file doesn't exist, return null order
      return NextResponse.json({ order: null })
    }
  } catch (error) {
    console.error('Error reading order:', error)
    return NextResponse.json({ error: 'Failed to read order' }, { status: 500 })
  }
}
