"use server"
import { cookies } from "next/headers"
import { decrypt } from "./session"
import { redirect } from "next/navigation"
import { cache } from "react"
import prisma from "@/config/prisma"

export const verifySession = cache(async () => {
  const cookieStore = await cookies()
  const cookie = cookieStore.get("session")?.value

  // Debug the cookie
  console.log("Cookie exists:", !!cookie)

  const session = await decrypt(cookie)

  // Debug the session
  console.log("Session decoded:", session)

  if (!session?.userId) {
    console.log("No user ID in session, redirecting to login")
    redirect("/login")
  }

  return { isAuth: true, userId: session.userId }
})

export const getUser = cache(async () => {
  const session = await verifySession()
  if (!session) return null

  try {
    const data = await prisma.user.findMany({
      where: {
        id: session.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    // Debug the user data
    console.log("User data fetched:", data)

    return data
  } catch (error) {
    console.error("Error fetching user data:", error)
    return null
  }
})

