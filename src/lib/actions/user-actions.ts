import { getUserProfile } from "@/lib/user-service"
import { getNotificationCount } from "@/lib/notification-service"

/**
 * Fetches user data along with notification count
 * Centralizes user data fetching for the home page
 */
export async function getUserWithNotifications() {
  try {
    const user = await getUserProfile()

    if (!user) {
      return { user: null, notificationCount: 0 }
    }

    const notificationCount = await getNotificationCount(user.id)

    return {
      user,
      notificationCount,
    }
  } catch (error) {
    console.error("Error fetching user data:", error)
    return { user: null, notificationCount: 0 }
  }
}

