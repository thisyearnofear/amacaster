import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: Request) {
  try {
    // Simple admin check - replace with proper auth later
    const isAdmin = process.env.NEXT_PUBLIC_ADMIN_MODE === 'true'
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { castHash, order } = body

    // Create orders directory if it doesn't exist
    const ordersDir = path.join(process.cwd(), 'data', 'orders')
    await fs.mkdir(ordersDir, { recursive: true })

    // Save order to a JSON file
    const orderPath = path.join(ordersDir, `${castHash}.json`)
    await fs.writeFile(orderPath, JSON.stringify(order, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving order:', error)
    return NextResponse.json({ error: 'Failed to save order' }, { status: 500 })
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
