"use client"

import { useState, useTransition } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  ArrowDown,
  ArrowUp,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Lightbulb,
  HelpCircle,
  BookOpen,
  Loader2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import { voteOnPost } from "@/lib/actions/vote-actions"
import { toast } from "sonner"
import type { VoteType } from "@prisma/client"
import Image from "next/image"

// Types that match our Prisma schema
type PostType = "fact" | "question" | "lesson"

type Author = {
  id: string
  name: string
  username: string
  profileImageUrl?: string | null
}

type Tag = {
  id: string
  name: string
}

type PostCardProps = {
  id: string
  author: Author
  content: string
  postType: PostType
  createdAt: Date
  tags: Tag[]
  externalLink?: string | null
  imageUrl?: string | null
  votes: {
    upvotes: number
    downvotes: number
    userVote?: VoteType | null
  }
}

export default function PostCard({
  id,
  author,
  content,
  postType,
  createdAt,
  tags,
  externalLink,
  imageUrl,
  votes,  
}: PostCardProps) {
  const [voteStatus, setVoteStatus] = useState<VoteType | null>(votes.userVote || null)
  const [upvoteCount, setUpvoteCount] = useState(votes.upvotes)
  const [downvoteCount, setDownvoteCount] = useState(votes.downvotes)
  const [isPending, startTransition] = useTransition()

  const handleVote = (voteType: VoteType | null) => {
    // Optimistically update UI
    const previousVoteStatus = voteStatus
    const previousUpvoteCount = upvoteCount
    const previousDownvoteCount = downvoteCount

    // Update local state optimistically
    if (voteType === "upvote") {
      if (voteStatus === "upvote") {
        // Removing upvote
        setVoteStatus(null)
        setUpvoteCount(upvoteCount - 1)
      } else {
        // Adding upvote
        setVoteStatus("upvote")
        setUpvoteCount(upvoteCount + 1)

        // If previously downvoted, remove downvote
        if (voteStatus === "downvote") {
          setDownvoteCount(downvoteCount - 1)
        }
      }
    } else if (voteType === "downvote") {
      if (voteStatus === "downvote") {
        // Removing downvote
        setVoteStatus(null)
        setDownvoteCount(downvoteCount - 1)
      } else {
        // Adding downvote
        setVoteStatus("downvote")
        setDownvoteCount(downvoteCount + 1)

        // If previously upvoted, remove upvote
        if (voteStatus === "upvote") {
          setUpvoteCount(upvoteCount - 1)
        }
      }
    }

    // Call server action
    startTransition(async () => {
      try {
        // If clicking the same vote type, toggle it off (null)
        const newVoteType = voteStatus === voteType ? null : voteType

        const result = await voteOnPost(id, newVoteType)

        // Update with actual server values
        setUpvoteCount(result.upvotes)
        setDownvoteCount(result.downvotes)
        setVoteStatus(result.userVote)
      } catch {
        // Revert to previous state on error
        setVoteStatus(previousVoteStatus)
        setUpvoteCount(previousUpvoteCount)
        setDownvoteCount(previousDownvoteCount)

        toast.error("Failed to update vote. Please try again.")
      }
    })
  }

  const getTypeIcon = () => {
    switch (postType) {
      case "fact":
        return <Lightbulb className="h-4 w-4 text-yellow-500" />
      case "question":
        return <HelpCircle className="h-4 w-4 text-blue-500" />
      case "lesson":
        return <BookOpen className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  const formattedDate = formatDistanceToNow(new Date(createdAt), { addSuffix: true })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar>
          <AvatarImage src={author.profileImageUrl || "/placeholder.svg?height=40&width=40"} alt={author.name} />
          <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{author.name}</span>
            <span className="text-sm text-muted-foreground">@{author.username}</span>
            <span className="text-sm text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1">
            {getTypeIcon()}
            <span className="text-xs capitalize">{postType}</span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-auto">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Bookmark</DropdownMenuItem>
            <DropdownMenuItem>Copy link</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Report</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="">
        <p className="mb-3">{content}</p>
        {externalLink && (
          <a
            href={externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            {externalLink}
          </a>
        )}
        {imageUrl && (
          <div className="mt-3 rounded-md overflow-hidden">
            <Image src={imageUrl || "/placeholder.svg"} alt="Post image" width={100} height={100} className="w-full h-auto" />
          </div>
        )}
        <div className="flex flex-wrap gap-1 mt-3">
          {tags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="text-xs">
              #{tag.name}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-2 border-t flex justify-between">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleVote("upvote")}
            className={voteStatus === "upvote" ? "text-green-500" : ""}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
          </Button>
          <span className="text-sm">{upvoteCount}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleVote("downvote")}
            className={voteStatus === "downvote" ? "text-red-500" : ""}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowDown className="h-4 w-4" />}
          </Button>
          <span className="text-sm">{downvoteCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

