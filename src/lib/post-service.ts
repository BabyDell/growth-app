'use server'


import prisma from "@/config/prisma"

// Define the processTags function
export async function processTags(tags: string[]): Promise<string[]> {
  // Implement the logic to process tags
  // For example, create new tags if they don't exist and return their IDs
  const processedTags = await Promise.all(tags.map(async (tag) => {
    const existingTag = await prisma.tag.findUnique({
      where: { name: tag },
    })
    if (existingTag) {
      return existingTag.id
    } else {
      const newTag = await prisma.tag.create({
        data: { name: tag },
      })
      return newTag.id
    }
  }))
  return processedTags
}