"use server"

import { cache } from "react"
import prisma from "@/config/prisma"
import type { UserProfile } from "@/types/user"

/**
 * Gets the current user's profile information
 * Returns null if not authenticated
 */
export const getUserProfile = cache(async (): Promise<UserProfile | null> => {
  try {
    // Try to verify the session, but don't redirect if not authenticated
    // This allows the function to be used in places where auth is optional
    const session = await getSessionWithoutRedirect()

    // If no session, return null
    if (!session?.userId) {
      return null
    }

    // Fetch user data
    const user = await prisma.user.findUnique({
      where: {
        id: session.userId.toString(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        profileImageUrl: true,
      },
    })

    if (!user) {
      return null
    }

    return user
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return null
  }
})

/**
 * Gets the session without redirecting if not authenticated
 * This is useful for components that need to handle both authenticated and unauthenticated states
 */
async function getSessionWithoutRedirect() {
  try {
    const { cookies } = await import("next/headers")
    const { decrypt } = await import("./session")

    const cookieStore = await cookies()
    const cookie = cookieStore.get("session")?.value

    if (!cookie) {
      return null
    }

    const session = await decrypt(cookie)
    return session
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

