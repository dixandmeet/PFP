export interface Post {
  id: string
  userId: string
  content: string
  mediaUrls: string[]
  mediaType: string | null
  isReel: boolean
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string | null
    image: string | null
    role: string
  }
  _count: {
    likes: number
    comments: number
    shares: number
  }
  isLiked?: boolean
  isBookmarked?: boolean
}

export interface Comment {
  id: string
  postId: string
  userId: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string | null
    image: string | null
  }
}
