import type { PostType } from "@prisma/client"

export interface BasePost {
  id?: string
  content: string
  postType: PostType
  externalLink?: string
  imageUrl?: string
  tags: string[] // Tag IDs or names
}



export interface PostWithUser extends BasePost {
  id: string
  userId: string
  user: {
    id: string
    name: string
    username: string
    profileImageUrl?: string
  }
  createdAt: Date
  updatedAt: Date
  _count?: {
    votes: number
  }
}

export interface LessonPost extends BasePost {
  postType: "lesson"
}

export interface QuestionPost extends BasePost {
  postType: "question"
}

export interface FactPost extends BasePost {
  postType: "fact"
}

export type CreatePostInput = BasePost
export type UpdatePostInput = Partial<BasePost> & { id: string }

export interface PostWithVotes extends PostWithUser {
  votes: {
    id: string
    voteType: "upvote" | "downvote"
  }[]
  userVote?: "upvote" | "downvote" | null
  voteCount: number
}

export interface PostsQueryOptions {
  postType?: PostType
  userId?: string
  tagId?: string
  limit?: number
  cursor?: string
  includeVotes?: boolean
}

// Post with user and tag information for display
export interface PostWithDetails {
  id: string
  content: string
  postType: PostType
  externalLink?: string
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    name: string
    username: string
    profileImageUrl?: string
  }
  tags: {
    id: string
    name: string
  }[]
  _count?: {
    votes: number
  }
  userVote?: {
    id: string
    voteType: "upvote" | "downvote"
  } | null
}

// Post creation result
export interface PostCreationResult {
  success: boolean
  post?: PostWithDetails
  error?: string
}

// Post update result
export interface PostUpdateResult {
  success: boolean
  post?: PostWithDetails
  error?: string
}

// Post deletion result
export interface PostDeletionResult {
  success: boolean
  error?: string
}

