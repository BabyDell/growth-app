import { z } from "zod"
import { PostType } from "@prisma/client"

// Base schema for all post types
export const basePostSchema = z.object({
  content: z.string().min(1, "Content is required").max(2000, "Content cannot exceed 2000 characters"),
  externalLink: z.string().url("Please enter a valid URL").optional().nullable(),
  imageUrl: z.string().url("Please enter a valid image URL").optional().nullable(),
  tags: z.array(z.string()).min(1, "At least one tag is required").max(5, "Cannot have more than 5 tags"),
})

// Lesson-specific validation
export const lessonPostSchema = basePostSchema.extend({
  postType: z.literal(PostType.lesson),
  content: z
    .string()
    .min(50, "Lessons should be at least 50 characters")
    .max(2000, "Lessons cannot exceed 2000 characters"),
})

// Question-specific validation
export const questionPostSchema = basePostSchema.extend({
  postType: z.literal(PostType.question),
  content: z
    .string()
    .min(10, "Questions should be at least 10 characters")
    .max(500, "Questions cannot exceed 500 characters"),
})

// Fact-specific validation
export const factPostSchema = basePostSchema.extend({
  postType: z.literal(PostType.fact),
  content: z.string().min(5, "Facts should be at least 5 characters").max(300, "Facts cannot exceed 300 characters"),
})

// Combined schema for all post types
export const createPostSchema = z.discriminatedUnion("postType", [lessonPostSchema, questionPostSchema, factPostSchema])

// Schema for updating posts - create a new discriminated union with the extended partial schemas
export const updatePostSchema = z.object({
  id: z.string().uuid(),
  postType: z.enum([PostType.lesson, PostType.question, PostType.fact]),
  content: z.string().optional(),
  externalLink: z.string().url("Please enter a valid URL").optional().nullable(),
  imageUrl: z.string().url("Please enter a valid image URL").optional().nullable(),
  tags: z.array(z.string()).optional(),
}).refine(
  (data) => {
    // Ensure that if postType is provided, the content validation matches that type
    if (data.postType && data.content) {
      if (data.postType === PostType.lesson && data.content.length < 50) {
        return false
      }
      if (data.postType === PostType.question && data.content.length < 10) {
        return false
      }
      if (data.postType === PostType.fact && data.content.length < 5) {
        return false
      }
    }
    return true
  },
  {
    message: "Content length must meet the requirements for the post type",
    path: ["content"],
  }
)