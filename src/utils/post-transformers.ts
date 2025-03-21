import type { Post, User, Vote, PostTag, Tag } from "@prisma/client"

type PostWithRelations = Post & {
  user: Pick<User, "id" | "name" | "username" | "profileImageUrl">
  tags: Array<PostTag & { tag: Tag }>
  votes: Vote[]
}

export type TransformedPost = {
  id: string
  author: {
    id: string
    name: string | null
    username: string
    profileImageUrl: string | null
  }
  content: string
  postType: PostType
  createdAt: Date
  externalLink: string | null
  imageUrl: string | null
  tags: Array<{
    id: string
    name: string
  }>
  votes: {
    upvotes: number
    downvotes: number
    userVote: "upvote" | "downvote" | null
  }
}

// Declare PostType
type PostType =  "lesson" | "question" | "fact"

/**
 * Transforms a post with relations from the database into the format
 * expected by the UI components
 */
export function transformPostData(post: PostWithRelations): TransformedPost {
  // Count upvotes and downvotes
  const upvotes = post.votes.filter((vote) => vote.voteType === "upvote").length
  const downvotes = post.votes.filter((vote) => vote.voteType === "downvote").length

  return {
    id: post.id,
    author: {
      id: post.user.id,
      name: post.user.name,
      username: post.user.username,
      profileImageUrl: post.user.profileImageUrl,
    },
    content: post.content,
    postType: post.postType,
    createdAt: post.createdAt,
    externalLink: post.externalLink,
    imageUrl: post.imageUrl,
    tags: post.tags.map((pt) => ({
      id: pt.tag.id,
      name: pt.tag.name,
    })),
    votes: {
      upvotes,
      downvotes,
      // User vote would be set client-side based on the current user
      userVote: null,
    },
  }
}

