"use client"

import { useEffect, useState } from "react"
import { getUserVoteOnPost } from "../actions/vote-actions"
import type { VoteType } from "@prisma/client"

/**
 * Hook to fetch and manage user votes for multiple posts
 *
 * @param postIds Array of post IDs to fetch votes for
 * @returns Object with post IDs as keys and vote types as values
 */
export function useUserVotes(postIds: string[]) {
  const [votes, setVotes] = useState<Record<string, VoteType | null>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVotes = async () => {
      setLoading(true)
      try {
        const votePromises = postIds.map(async (postId) => {
          const vote = await getUserVoteOnPost(postId)
          return { postId, vote }
        })

        const results = await Promise.all(votePromises)

        const voteMap = results.reduce(
          (acc, { postId, vote }) => {
            acc[postId] = vote
            return acc
          },
          {} as Record<string, VoteType | null>,
        )

        setVotes(voteMap)
      } catch (error) {
        console.error("Error fetching user votes:", error)
      } finally {
        setLoading(false)
      }
    }

    if (postIds.length > 0) {
      fetchVotes()
    } else {
      setLoading(false)
    }
  }, [postIds])

  return { votes, loading }
}

