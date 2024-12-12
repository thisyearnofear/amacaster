import { NeynarAPIClient } from '@neynar/nodejs-sdk'

interface Cast {
  hash: string
  thread_hash: string
  parent_hash?: string
  author: {
    username: string
    display_name: string
    pfp_url: string
    fid: number
  }
  text: string
  timestamp: string
  reactions: {
    likes_count: number
    recasts_count: number
  }
  replies: {
    count: number
  }
  mentioned_profiles?: Array<{
    username: string
    display_name: string
    pfp_url: string
    fid: number
  }>
}

interface CastResponse {
  result: {
    cast: Cast
  }
}

interface ThreadResponse {
  result: {
    casts: Cast[]
  }
}

class NeynarClient {
  private apiUrl = 'https://api.neynar.com/v2/farcaster'
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async lookupCastByUrl(url: string): Promise<CastResponse> {
    console.log(
      'Request URL:',
      `${this.apiUrl}/cast?type=url&identifier=${url}`,
    )
    console.log('API Key:', this.apiKey)

    const response = await fetch(
      `${this.apiUrl}/cast?type=url&identifier=${url}`,
      {
        headers: {
          api_key: this.apiKey,
          Accept: 'application/json',
        },
      },
    )

    if (!response.ok) {
      console.log('Response status:', response.status)
      console.log('Response status text:', response.statusText)
      throw new Error('Failed to fetch cast')
    }

    const data = await response.json()
    console.log('API Response:', data)

    return {
      result: {
        cast: data.cast as Cast,
      },
    }
  }

  async fetchThread(threadHash: string): Promise<ThreadResponse> {
    console.log(
      'Request URL:',
      `https://api.neynar.com/v1/farcaster/all-casts-in-thread?threadHash=${threadHash}`,
    )

    const response = await fetch(
      `https://api.neynar.com/v1/farcaster/all-casts-in-thread?threadHash=${threadHash}`,
      {
        headers: {
          api_key: this.apiKey,
          Accept: 'application/json',
        },
      },
    )

    if (!response.ok) {
      console.log('Response status:', response.status)
      console.log('Response status text:', response.statusText)
      throw new Error('Failed to fetch thread')
    }

    const data = await response.json()
    console.log('API Response:', data)

    return {
      result: {
        casts: data.result.casts as Cast[],
      },
    }
  }
}

// Create a new instance with the API key
const neynarClient = new NeynarClient(process.env.NEYNAR_API_KEY!)

export type { Cast }
export default neynarClient
