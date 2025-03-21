import { type NextRequest, NextResponse } from "next/server"
import { decrypt } from "@/lib/session"

const protectedRoutes = ["/home", "/profile", "/dashboard"]
const publicRoutes = ["/auth/login", "/auth/signup", "/"]

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  console.log("path", path)
  const isDev = process.env.NODE_ENV === "development"

  if (isDev) console.log(`Middleware triggered for path: ${path}`)

  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))
  const isPublicRoute = publicRoutes.some((route) => path === route)

  if (isDev) {
    console.log(`Is protected route: ${isProtectedRoute}`)
    console.log(`Is public route: ${isPublicRoute}`)
  }

  // Handle session check
  let userId = null
  try {
    const cookie = req.cookies.get("session")?.value
    if (cookie) {
      const session = await decrypt(cookie)
      if (isDev) console.log(`Session payload:`, session)
      userId = session?.userId
    }
  } catch (error) {
    console.error("Error decrypting session:", error)
  }

  // Debug cookie information
  if (isDev) {
    console.log("Cookie exists:", !!req.cookies.get("session")?.value)
    console.log("User ID from session:", userId)
  }

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !userId) {
    if (isDev) console.log("Redirecting to /login - No valid session")
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  // Redirect authenticated users from public routes (including landing page)
  if (isPublicRoute && userId) {
    if (isDev) console.log("Redirecting to /home - User already authenticated")
    return NextResponse.redirect(new URL("/home", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
}

