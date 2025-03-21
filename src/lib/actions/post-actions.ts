"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/config/prisma"
import { verifySession } from "@/lib/dal"
import { createPostSchema, updatePostSchema } from "../validations/post-schema"
import type { CreatePostInput, UpdatePostInput } from "@/types/posts"
import { processTags } from "../post-service"
import type { PostType } from "@prisma/client"
import { transformPostData } from "@/utils/post-transformers"

/**
 * Creates a new post
 */
export async function createPost(input: CreatePostInput) {
  try {
    // Verify user is authenticated
    const session = await verifySession()
    const userId: string = session.userId as string

    // Validate input based on post type
    const validationResult = createPostSchema.safeParse(input)

    if (!validationResult.success) {
      return {
        success: false,
        errors: validationResult.error.flatten().fieldErrors,
      }
    }

    const { content, postType, externalLink, imageUrl, tags } = validationResult.data

    // Process tags - create new ones if they don't exist
    const processedTags = await processTags(tags)

    // Create the post
    const post = await prisma.post.create({
      data: {
        userId,
        content,
        postType,
        externalLink: externalLink || null,
        imageUrl: imageUrl || null,
        tags: {
          create: processedTags.map((tagId) => ({
            tag: {
              connect: {
                id: tagId,
              },
            },
          })),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    })

    // Extract and notify mentioned users TODO: Implement this
   

    // Revalidate the posts page
    revalidatePath("/")
    revalidatePath(`/profile/${userId}`)

    return {
      success: true,
      data: post,
    }
  } catch (error) {
    console.error("Error creating post:", error)
    return {
      success: false,
      errors: {
        server: ["Failed to create post. Please try again."],
      },
    }
  }
}

/**
 * Updates an existing post
 */
export async function updatePost(input: UpdatePostInput) {
  try {
    // Verify user is authenticated
    const session = await verifySession()
    const userId: string = session.userId as string

    // Validate input
    const validationResult = updatePostSchema.safeParse(input)

    if (!validationResult.success) {
      return {
        success: false,
        errors: validationResult.error.flatten().fieldErrors,
      }
    }

    const { id, content, postType, externalLink, imageUrl, tags } = validationResult.data

    // Check if post exists and belongs to the user
    const existingPost = await prisma.post.findUnique({
      where: {
        id,
      },
      include: {
        tags: {
          select: {
            tagId: true,
          },
        },
      },
    })

    if (!existingPost) {
      return {
        success: false,
        errors: {
          server: ["Post not found."],
        },
      }
    }

    if (existingPost.userId !== userId) {
      return {
        success: false,
        errors: {
          server: ["You don't have permission to update this post."],
        },
      }
    }

    // Prepare update data
    const updateData: Partial<UpdatePostInput> = {}

    if (content !== undefined) updateData.content = content
    if (postType !== undefined) updateData.postType = postType
    if (externalLink !== undefined) updateData.externalLink = externalLink ?? undefined
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl ?? undefined

    // Process tags if provided
    let tagOperations = {}
    if (tags) {
      const processedTags = await processTags(tags)

      // Get existing tag IDs
      const existingTagIds = existingPost.tags.map((tag) => tag.tagId)

      // Determine which tags to disconnect and which to connect
      const tagsToDisconnect = existingTagIds.filter((id) => !processedTags.includes(id))
      const tagsToConnect = processedTags.filter((id) => !existingTagIds.includes(id))

      tagOperations = {
        disconnect: tagsToDisconnect.map((tagId) => ({
          tagId,
          postId: id,
        })),
        create: tagsToConnect.map((tagId) => ({
          tag: {
            connect: {
              id: tagId,
            },
          },
        })),
      }
    }

    // Update the post
    const updatedPost = await prisma.post.update({
      where: {
        id,
      },
      data: {
        ...updateData,
        updatedAt: new Date(),
        tags: tagOperations,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    // If content was updated, check for new mentions TODO: Implement this
   

    // Revalidate the post page and profile page
    revalidatePath(`/posts/${id}`)
    revalidatePath(`/profile/${userId}`)

    return {
      success: true,
      data: updatedPost,
    }
  } catch (error) {
    console.error("Error updating post:", error)
    return {
      success: false,
      errors: {
        server: ["Failed to update post. Please try again."],
      },
    }
  }
}

/**
 * Deletes a post
 */
export async function deletePost(postId: string) {
  try {
    // Verify user is authenticated
    const { userId } = await verifySession()

    // Check if post exists and belongs to the user
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    })

    if (!post) {
      return {
        success: false,
        errors: {
          server: ["Post not found."],
        },
      }
    }

    if (post.userId !== userId) {
      return {
        success: false,
        errors: {
          server: ["You don't have permission to delete this post."],
        },
      }
    }

    // Delete the post
    await prisma.post.delete({
      where: {
        id: postId,
      },
    })

    // Revalidate the profile page
    revalidatePath(`/profile/${userId}`)

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error deleting post:", error)
    return {
      success: false,
      errors: {
        server: ["Failed to delete post. Please try again."],
      },
    }
  }
}

/**
 * Gets a single post by ID
 */
export async function getPost(postId: string) {
  try {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
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
        _count: {
          select: {
            votes: true,
          },
        },
      },
    })

    if (!post) {
      return {
        success: false,
        errors: {
          server: ["Post not found."],
        },
      }
    }

    return {
      success: true,
      data: post,
    }
  } catch (error) {
    console.error("Error fetching post:", error)
    return {
      success: false,
      errors: {
        server: ["Failed to fetch post. Please try again."],
      },
    }
  }
}

/**
 * Fetches posts from the database with optional filtering by type
 *
 * @param type Optional post type filter
 * @param limit Number of posts to fetch (default: 10)
 * @param skip Number of posts to skip for pagination (default: 0)
 * @returns Transformed post data ready for component consumption
 */
export async function getPosts(type?: PostType, limit = 10, skip = 0) {
  try {
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
    return posts.map(transformPostData)
  } catch (error) {
    console.error("Error fetching posts:", error)
    return []
  }
}

/**
 * Fetches initial posts for the home page
 * This is a convenience wrapper around getPosts for the home page
 */
export async function getInitialPosts(type?: PostType) {
  return getPosts(type, 10, 0)
}


/**
 * Votes on a post (upvote or downvote)
 */
//  export async function voteOnPost(postId: string, voteType: "upvote" | "downvote") {
//   try {
//     // Verify user is authenticated
//     const { userId } = await verifySession()

//     // Check if post exists
//     const post = await prisma.post.findUnique({
//       where: {
//         id: postId,
//       },
//       select: {
//         id: true,
//         userId: true,
//       },
//     })

//     if (!post) {
//       return {
//         success: false,
//         errors: {
//           server: ["Post not found."],
//         },
//       }
//     }

//     // Check if user has already voted on this post
//     const existingVote = await prisma.vote.findUnique({
//       where: {
//         userId_postId: {
//           userId,
//           postId,
//         },
//       },
//     })

//     if (existingVote) {
//       if (existingVote.voteType === voteType) {
//         // Remove the vote if it's the same type (toggle off)
//         await prisma.vote.delete({
//           where: {
//             id: existingVote.id,
//           },
//         })
//       } else {
//         // Update the vote if it's a different type
//         await prisma.vote.update({
//           where: {
//             id: existingVote.id,
//           },
//           data: {
//             voteType,
//           },
//         })
//       }
//     } else {
//       // Create a new vote
//       await prisma.vote.create({
//         data: {
//           userId,
//           postId,
//           voteType,
//         },
//       })

//       // Create a notification for the post owner (if not self-vote)
//       if (post.userId !== userId) {
//         await prisma.notification.create({
//           data: {
//             userId: post.userId,
//             content: `Someone ${voteType}d your post`,
//             type: voteType === "upvote" ? "upvote" : "downvote",
//             relatedId: postId,
//           },
//         })
//       }
//     }

//     // Revalidate the post page
//     revalidatePath(`/posts/${postId}`)

//     return {
//       success: true,
//     }
//   } catch (error) {
//     console.error("Error voting on post:", error)
//     return {
//       success: false,
//       errors: {
//         server: ["Failed to vote on post. Please try again."],
//       },
//     }
//   }
//  }

