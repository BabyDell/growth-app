"use server"

import { cache } from "react"
import prisma from "@/config/prisma"

/**
 * Gets the count of unread notifications for a user
 */
export const getNotificationCount = cache(async (userId: string): Promise<number> => {
  if (!userId) {
    return 0
  }

  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    })

    return count
  } catch (error) {
    console.error("Error fetching notification count:", error)
    return 0
  }
})

