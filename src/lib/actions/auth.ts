"use server"
import { SignupFormSchema, type FormState } from "@/lib/validations/form-schema"
import { cookies, headers } from "next/headers"
import { decrypt } from "@/lib/session"
import { maskEmail, getClientIP, logAuthEvent } from "@/lib/auth-security"
import prisma from "@/config/prisma"
import bcryptjs from "bcryptjs"
import { redirect } from "next/navigation"
import { createSession, deleteSession } from "@/lib/session"

export async function signup(state: FormState, formData: FormData): Promise<FormState> {
  // Validate form fields
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  })
  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please correct the errors in the form.",
    }
  }

  const { name, username, email, password } = validatedFields.data
  const ip = await getClientIP()
  const userAgent = (await headers()).get("user-agent") || "unknown"

  try {
    // Check if the email already exists
    const existingUserByEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive", // Makes the comparison case-insensitive
        },
      },
    })

    if (existingUserByEmail) {
      // Log the failed signup attempt
      await logAuthEvent({
        type: "login_failed",
        email: await maskEmail(email),
        ip,
        userAgent,
        metadata: { reason: "email_exists" },
      })

      return {
        errors: {
          email: ["This email is already in use. Please use a different email."],
        },
        message: "Email already exists.",
      }
    }

    // Check if the username already exists
    const existingUserByUsername = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive", // Makes the comparison case-insensitive
        },
      },
    })

    if (existingUserByUsername) {
      return {
        errors: {
          username: ["This username is already taken. Please choose a different username."],
        },
        message: "Username already exists.",
      }
    }

    const hashedPassword = await bcryptjs.hash(password, 12) // Increased cost factor to 12
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        username, 
        passwordHash: hashedPassword,
      },
      select: {
        id: true,
      },
    })

    // Log successful signup
    await logAuthEvent({
      type: "signup",
      userId: newUser.id,
      email: await maskEmail(email),
      ip,
      userAgent,
    })

    // Create and verify the session was created successfully
    const sessionId = await createSession(newUser.id)
    if (!sessionId) {
      throw new Error("Failed to create session")
    }

    // Add a small delay to ensure cookie is set before redirect
    await new Promise((resolve) => setTimeout(resolve, 100))
  } catch (error) {
    // Log the error event
    await logAuthEvent({
      type: "login_failed",
      email: await maskEmail(email),
      ip,
      userAgent,
      metadata: { reason: "server_error" },
    })

    return {
      message: "An error occurred while creating your account.",
      errors: {
        server: [(error as Error).message],
      },
    }
  }

  redirect("/home")
}

export async function login(state: FormState, formData: FormData): Promise<FormState> {
  const identifier = formData.get("identifier") as string
  const password = formData.get("password") as string

  // Add debug logging
  console.log("Login attempt for identifier:", identifier)

  try {
    // Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          {
            email: {
              equals: identifier,
              mode: "insensitive", // Makes the comparison case-insensitive
            },
          },
          {
            username: {
              equals: identifier,
              mode: "insensitive", // Makes the comparison case-insensitive
            },
          },
        ],
      },
    })

    // Debug user lookup results
    console.log("User found:", !!user)

    if (!user || !user.passwordHash) {
      console.log("User not found or password hash missing")
      return {
        errors: {
          server: ["Invalid username/email or password"],
        },
      }
    }

    const passwordMatch = await bcryptjs.compare(password, user.passwordHash)
    console.log("Password match:", passwordMatch)

    if (!passwordMatch) {
      return {
        errors: {
          server: ["Invalid username/email or password"],
        },
      }
    }

    // Create and verify the session was created successfully
    const sessionId = await createSession(user.id)
    console.log("Session created with ID:", sessionId)

    if (!sessionId) {
      throw new Error("Failed to create session")
    }

    // Add a small delay to ensure cookie is set before redirect
    await new Promise((resolve) => setTimeout(resolve, 100))
  } catch (error) {
    console.error("Login error:", error)
    return {
      errors: {
        server: ["An error occurred during login. Please try again."],
      },
    }
  }

  // Debug right before redirect
  console.log("Authentication successful, redirecting to /posts")
  redirect("/home")
}

export async function logout() {
  const session = (await cookies()).get("session")?.value
  const payload = await decrypt(session)
  const userId = payload?.userId as string
  const ip = await getClientIP()
  const userAgent = (await headers()).get("user-agent") || "unknown"

  try {
    if (userId) {
      // Log the logout event
      await logAuthEvent({
        type: "logout",
        userId,
        ip,
        userAgent,
      })
    }

    await deleteSession()
  } catch (error) {
    console.error("Logout error:", error)
    // Even if there's an error with logging, we should still delete the session
    await deleteSession()
  } finally {
    redirect("/")
  }
}

