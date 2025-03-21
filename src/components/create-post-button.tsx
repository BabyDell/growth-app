"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, Loader2 } from "lucide-react"
import { createPost } from "@/lib/actions/post-actions"
import { toast } from "sonner"
import { PostType } from "@prisma/client"

export default function CreatePostButton() {
  const router = useRouter()
  const [postType, setPostType] = useState<PostType>(PostType.fact)
  const [content, setContent] = useState<string>("")
  const [tags, setTags] = useState<string>("")
  const [externalLink, setExternalLink] = useState<string>("")
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      // Transform tags from comma-separated string to array of strings
      const tagArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      // Call the server action with the form data
      const result = await createPost({
        content,
        postType, // Using the Prisma enum value directly
        tags: tagArray,
        externalLink: externalLink || undefined,
      })

      if (result.success) {
        // Show success message
        toast.success("Post created", {
          description: "Your post has been published successfully.",
        })

        // Reset form and close dialog
        setContent("")
        setTags("")
        setExternalLink("")
        setOpen(false)

        // Refresh the page to show the new post
        router.refresh()
      } else {
        // Show validation errors
        setErrors(result.errors || { server: ["Failed to create post"] })

        // Show error toast for server errors
        if (result.errors && "server" in result.errors) {
          toast.error("Error", {
            description: result.errors.server[0],
          })
        }
      }
    } catch (error) {
      console.error("Error creating post:", error)
      toast.error("Error", {
        description: "Something went wrong. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper function to display field errors
  const getFieldError = (field: string) => {
    return errors[field] ? errors[field][0] : null
  }

  // Get placeholder text based on post type
  const getPlaceholder = () => {
    switch (postType) {
      case PostType.fact:
        return "Share an interesting fact..."
      case PostType.question:
        return "Ask a question..."
      case PostType.lesson:
        return "Share a lesson you've learned..."
      default:
        return "Write your post..."
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2">
          <PlusCircle className="h-4 w-4" />
          Create Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create a new post</DialogTitle>
            <DialogDescription>Share knowledge, ask questions, or teach others something new.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="post-type">Post Type</Label>
              <Select value={postType} onValueChange={(value) => setPostType(value as PostType)}>
                <SelectTrigger id="post-type">
                  <SelectValue placeholder="Select post type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PostType.fact}>Fact</SelectItem>
                  <SelectItem value={PostType.question}>Question</SelectItem>
                  <SelectItem value={PostType.lesson}>Lesson</SelectItem>
                </SelectContent>
              </Select>
              {getFieldError("postType") && <p className="text-sm text-destructive">{getFieldError("postType")}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder={getPlaceholder()}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px]"
                required
              />
              {getFieldError("content") && <p className="text-sm text-destructive">{getFieldError("content")}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                placeholder="knowledge, science, history"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              {getFieldError("tags") && <p className="text-sm text-destructive">{getFieldError("tags")}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="external-link">External Link (optional)</Label>
              <Input
                id="external-link"
                placeholder="https://example.com/article"
                value={externalLink}
                onChange={(e) => setExternalLink(e.target.value)}
              />
              {getFieldError("externalLink") && (
                <p className="text-sm text-destructive">{getFieldError("externalLink")}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Post"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}