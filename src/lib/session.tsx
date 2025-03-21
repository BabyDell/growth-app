import "server-only"
import { type JWTPayload, SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import prisma from "@/config/prisma"

const secretKey = process.env.SESSION_SECRET
if (!secretKey) {
  console.error("SESSION_SECRET is not defined in environment variables")
  throw new Error("SESSION_SECRET is required for authentication")
}
const encodedKey = new TextEncoder().encode(secretKey)

export async function encrypt(payload: JWTPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey)
}

export async function decrypt(session: string | undefined = ""): Promise<JWTPayload | null> {
  if (!session) return null
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    })
    return payload as JWTPayload
  } catch (error) {
    console.error("Failed to verify session:", error)
    return null
  }
}

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const session = await prisma.session.create({
    data: {
      userId: userId,
      expires: expiresAt,
      sessionToken: crypto.randomUUID(),
    },
    select: {
      id: true,
    },
  })

  const sessionId = session.id
  console.log("Session created in database with ID:", sessionId)

  const encryptedSession = await encrypt({ sessionId, userId, expiresAt })
  console.log("Session encrypted:", encryptedSession)

  const cookieStore = await cookies()
  cookieStore.set("session", encryptedSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  })
  console.log("Session stored in cookies")

  return sessionId
}

export async function updateSession() {
  const session = (await cookies()).get("session")?.value
  const payload = await decrypt(session)

  if (!session || !payload) {
    return null
  }

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const cookieStore = await cookies()
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expires,
    sameSite: "lax",
    path: "/",
  })
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}

