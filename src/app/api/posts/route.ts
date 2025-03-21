import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/config/prisma"
import type { PostType } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type") as PostType | null
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = Number.parseInt(searchParams.get("skip") || "0")

    // Base query to get posts with related data
    const query = {
      take: limit,
      skip: skip,
      orderBy: {
        createdAt: "desc" as const,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            profileImageUrl: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        votes: true,
      },
      where: {},
    }

    // Add filter for post type if specified
    if (type) {
      query.where = { postType: type }
    }

    const posts = await prisma.post.findMany(query)

    // Transform the data to match our component props
    const transformedPosts = posts.map((post) => {
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
          userVote: null,
        },
      }
    })

    return NextResponse.json(transformedPosts)
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}

