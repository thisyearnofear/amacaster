export interface Author {
  fid: number
  username: string
  fname?: string
  display_name: string
  avatar_url: string
  custody_address?: string
}

export interface Cast {
  hash: string
  thread_hash: string
  parent_hash?: string
  author: Author
  text: string
  timestamp: string
  reactions: {
    likes_count: number
    recasts_count: number
  }
  replies: {
    count: number
  }
  mentioned_profiles?: Author[]
}

export interface NeynarCast {
  hash: string
  thread_hash: string
  parent_hash?: string
  author: {
    fid: number
    username: string
    display_name: string
    pfp_url?: string
    pfp?: {
      url: string
    }
    avatar_url?: string
    fname?: string
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
    fid: number
    username: string
    display_name: string
    pfp_url?: string
    avatar_url?: string
    fname?: string
  }>
}

export interface DraggableQASectionProps {
  secondTier: Cast[]
  thirdTier: AnswerEntry[]
  isAdmin: boolean
  neynarUser?: NeynarUser | null
  onOrderChange: (newSecondTier: Cast[], newThirdTier: AnswerEntry[]) => void
}

export interface AnswerEntry extends Cast {
  answers?: Cast[]
}

export interface AnswerStack {
  answers: Cast[]
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

export interface QuestionRanking {
  questionHash: string
  usefulnessScore: number
  selected: boolean
}

export interface MatchSubmission {
  questionHash: string
  answerHash: string
  usefulnessScore: number
  ranking: number
}
