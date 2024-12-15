export interface Author {
  fid: number;
  username: string;
  fname: string;
  display_name: string;
  avatar_url: string;
  custody_address: string;
}

export interface Cast {
  hash: string;
  thread_hash?: string;
  parent_hash?: string;
  author: Author;
  text: string;
  timestamp: string;
  reactions: {
    likes_count: number;
    recasts_count: number;
  };
  replies?: {
    count: number;
  };
}

export interface NeynarCast {
  hash: string;
  thread_hash: string;
  parent_hash?: string;
  author: {
    fid: number;
    username: string;
    display_name: string;
    pfp_url: string;
    pfp?: {
      url: string;
    };
    avatar_url?: string;
  };
  text: string;
  timestamp: string;
  reactions: {
    likes_count: number;
    recasts_count: number;
  };
  replies: {
    count: number;
  };
  mentioned_profiles?: Array<{
    username: string;
    display_name: string;
    pfp_url: string;
    fid: number;
  }>;
}

export interface QAItemProps {
    question: Cast
    answer?: Cast
    thirdTierResponses?: Cast[]
    amaUser: Author
    userAvatar: string
  }