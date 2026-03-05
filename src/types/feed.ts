// Types TypeScript pour le Feed Social

export interface PostUser {
  id: string
  email: string
  role: string
  playerProfile?: {
    firstName: string
    lastName: string
    primaryPosition?: string
    profilePicture?: string
  }
  agentProfile?: {
    firstName: string
    lastName: string
    agencyName?: string
    profilePicture?: string
  }
  clubProfile?: {
    clubName: string
    logo?: string
  }
}

export interface Post {
  id: string
  content: string
  mediaUrls: string[]
  createdAt: string
  updatedAt?: string
  user: PostUser
  _count?: {
    likes: number
    comments: number
    shares: number
  }
  isLiked?: boolean
  isBookmarked?: boolean
  mentions?: Mention[]
  hashtags?: Hashtag[]
  comments?: Comment[]
}

export interface Comment {
  id: string
  content: string
  createdAt: string
  updatedAt?: string
  user: PostUser
}

export interface Mention {
  id: string
  postId: string
  userId: string
  createdAt: string
}

export interface Hashtag {
  id: string
  tag: string
  createdAt: string
}

export interface Share {
  id: string
  postId: string
  userId: string
  comment?: string
  createdAt: string
}

export interface Bookmark {
  id: string
  postId: string
  userId: string
  createdAt: string
}

export interface MediaFile {
  id: string
  url: string
  type: 'image' | 'video' | 'document'
  filename: string
  size: number
  mimeType: string
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PostsResponse {
  posts: Post[]
  pagination: PaginationInfo
}

export interface CommentsResponse {
  comments: Comment[]
  pagination: PaginationInfo
}
