"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/config/prisma"
import { verifySession } from "@/lib/dal"
import { createNotification } from "./notification-action"
import type { VoteType } from "@prisma/client"

/**
 * Handles voting on a post (upvote or downvote)
 *
 * @param postId - The ID of the post to vote on
 * @param voteType - The type of vote (upvote or downvote)
 * @returns An object containing the updated vote counts and the user's vote
 */
export async function voteOnPost(postId: string, voteType: VoteType | null) {
  try {
    // Verify the user is authenticated
    const session = await verifySession()
    if (!session) {
      throw new Error("Authentication required")
    }

    // Extract userId from session
    const userId = session.userId as string;

    // Get the current post to check if it exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, userId: true },
    })

    if (!post) {
      throw new Error("Post not found")
    }

    // Check if the user has already voted on this post
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    })

    // If removing vote (voteType is null)
    if (voteType === null) {
      if (existingVote) {
        // Delete the vote
        await prisma.vote.delete({
          where: {
            userId_postId: {
              userId,
              postId,
            },
          },
        })
      }
    }
    // If changing vote or adding new vote
    else if (!existingVote) {
      // Create a new vote
      await prisma.vote.create({
        data: {
          userId,
          postId,
          voteType,
        },
      })

      // Create notification for upvotes (only if not the user's own post)
      if (voteType === "upvote" && post.userId !== userId) {
        await createNotification({
          userId: post.userId,
          content: "Someone upvoted your post",
          type: "upvote",
          relatedId: postId,
        })
      }
    } else if (existingVote.voteType !== voteType) {
      // Update the existing vote
      await prisma.vote.update({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
        data: {
          voteType,
        },
      })

      // Create notification for upvotes (only if changing to upvote and not the user's own post)
      if (voteType === "upvote" && post.userId !== userId) {
        await createNotification({
          userId: post.userId,
          content: "Someone upvoted your post",
          type: "upvote",
          relatedId: postId,
        })
      }
    }

    // Get updated vote counts
    const upvotes = await prisma.vote.count({
      where: {
        postId,
        voteType: "upvote",
      },
    })

    const downvotes = await prisma.vote.count({
      where: {
        postId,
        voteType: "downvote",
      },
    })

    // Get the user's current vote
    const userVote = voteType

    // Revalidate the post page to update the UI
    revalidatePath(`/posts/${postId}`)
    revalidatePath("/") // Revalidate homepage if posts appear there

    return {
      upvotes,
      downvotes,
      userVote,
    }
  } catch (error) {
    console.error("Error voting on post:", error)
    throw new Error("Failed to vote on post")
  }
}

/**
 * Gets the current user's vote on a post
 *
 * @param postId - The ID of the post
 * @returns The user's vote type or null if they haven't voted
 */
export async function getUserVoteOnPost(postId: string) {
  try {
    const session = await verifySession()
    if (!session) {
      return null
    }

    const userId = session.userId as string;


    const vote = await prisma.vote.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
      select: {
        voteType: true,
      },
    })

    return vote?.voteType || null
  } catch (error) {
    console.error("Error getting user vote:", error)
    return null
  }
}

