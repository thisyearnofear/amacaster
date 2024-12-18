export interface Author {
  fid: number
  username: string
  fname: string
  display_name: string
  avatar_url: string
  custody_address: string
}

export interface NeynarUser {
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

export interface Cast {
  hash: string
  thread_hash: string
  parent_hash?: string
  author: {
    username: string
    display_name: string
    avatar_url: string
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
    avatar_url: string
    fid: number
  }>
}

export interface QAItemProps {
  question: Cast
  answer?: Cast
  thirdTierResponses?: Cast[]
  amaUser: Author
  userAvatar: string
}
