"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import PostCard from "@/components/post-card"
import { Spinner } from "./ui/spinner"
import type { PostType } from "@prisma/client"

type Post = {
  id: string
  author: {
    id: string
    name: string
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

interface InfinitePostFeedProps {
  initialPosts: Post[]
  postType?: PostType
}

export default function InfinitePostFeed({ initialPosts, postType }: InfinitePostFeedProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const loaderRef = useRef<HTMLDivElement>(null)
  const postsPerPage = 10

  const loadMorePosts = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    try {
      const skip = page * postsPerPage
      const typeParam = postType ? `&type=${postType}` : ""
      const response = await fetch(`/api/posts?limit=${postsPerPage}&skip=${skip}${typeParam}`)

      if (!response.ok) {
        throw new Error("Failed to fetch posts")
      }

      const newPosts = await response.json()

      if (newPosts.length === 0) {
        setHasMore(false)
      } else {
        setPosts((prevPosts) => [...prevPosts, ...newPosts])
        setPage((prevPage) => prevPage + 1)
      }
    } catch (error) {
      console.error("Error loading more posts:", error)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, hasMore, page, postType])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && hasMore && !isLoading) {
          loadMorePosts()
        }
      },
      { threshold: 0.1 },
    )

    const currentLoaderRef = loaderRef.current
    if (currentLoaderRef) {
      observer.observe(currentLoaderRef)
    }

    return () => {
      if (currentLoaderRef) {
        observer.unobserve(currentLoaderRef)
      }
    }
  }, [loadMorePosts, hasMore, isLoading])

  // Reset when postType changes
  useEffect(() => {
    setPosts(initialPosts)
    setPage(1)
    setHasMore(true)
  }, [postType, initialPosts])

  if (posts.length === 0 && !isLoading) {
    return <p className="text-center py-8 text-muted-foreground">No posts found</p>
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          id={post.id}
          author={post.author}
          content={post.content}
          postType={post.postType}
          createdAt={post.createdAt}
          tags={post.tags}
          externalLink={post.externalLink}
          imageUrl={post.imageUrl}
          votes={post.votes}
        />
      ))}

      <div ref={loaderRef} className="py-4 flex justify-center">
        {isLoading && <Spinner className="h-6 w-6" />}
      </div>

      {!hasMore && posts.length > 0 && <p className="text-center py-4 text-muted-foreground">No more posts to load</p>}
    </div>
  )
}