import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { username: string } },
) {
  try {
    console.log('Fetching profile for username:', params.username)
    const url = `https://api.web3.bio/profile/${params.username}.farcaster`
    console.log('Fetching from URL:', url)

    const response = await fetch(url)
    console.log('Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error response:', errorText)
      return NextResponse.json(
        {
          error: 'Failed to fetch profile',
          details: errorText,
          status: response.status,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log('Raw profile data:', JSON.stringify(data, null, 2))

    if (!Array.isArray(data)) {
      console.error('Unexpected data format - expected array:', data)
      return NextResponse.json(
        {
          error: 'Invalid data format',
          details: 'Expected array of profiles',
        },
        { status: 500 },
      )
    }

    if (data.length === 0) {
      console.error('No profile data found')
      return NextResponse.json(
        {
          error: 'Profile not found',
          details: 'No profile data returned',
        },
        { status: 404 },
      )
    }

    console.log(
      'Successfully fetched profile data:',
      JSON.stringify(data[0], null, 2),
    )
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in profile API route:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch profile',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
