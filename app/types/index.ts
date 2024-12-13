// Neynar API types
export interface NeynarAuthor {
  fid: number
  username: string
  display_name: string
  pfp_url: string
}

export interface NeynarCast {
  hash: string
  parent_hash?: string
  author: NeynarAuthor
  text: string
  timestamp: string
  reactions: {
    likes_count: number
    recasts_count: number
  }
}

// Our app types
export interface Author {
  fid: number | string
  username?: string
  fname?: string
  display_name: string
  avatar_url: string
  custody_address: string
}

export interface Cast {
  hash: string
  parent_hash?: string
  author: Author
  text: string
  timestamp: string
  reactions: {
    likes_count: number
    recasts_count: number
  }
}

export interface QAItemProps {
  question: Cast
  answer?: Cast
  thirdTierResponses?: Cast[]
  amaUser: Author
  userAvatar: string
}
