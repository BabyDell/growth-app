"use server"

import prisma from "@/config/prisma"
import type { NotificationType } from "@prisma/client"

interface CreateNotificationParams {
  userId: string
  content: string
  type: NotificationType
  relatedId?: string
}

/**
 * Creates a new notification for a user
 */
export async function createNotification({ userId, content, type, relatedId }: CreateNotificationParams) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        content,
        type,
        relatedId,
        isRead: false,
      },
    })
  } catch (error) {
    console.error("Error creating notification:", error)
  }
}

/**
 * Gets the count of unread notifications for a user
 */
export async function getNotificationCount(userId: string) {
  try {
    return await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    })
  } catch (error) {
    console.error("Error getting notification count:", error)
    return 0
  }
}

