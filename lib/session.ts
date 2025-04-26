"use server"

import { cookies } from "next/headers"

// Session duration: 7 days
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000

export async function createSession(username: string) {
  const expires = new Date(Date.now() + SESSION_DURATION)

  // Create a simple session object
  const session = {
    username,
    expires: expires.toISOString(),
  }

  // Store the session in a cookie
  const cookieStore = cookies()
  cookieStore.set("session", JSON.stringify(session), {
    httpOnly: true,
    expires,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
}

export async function getSession() {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get("session")

  if (!sessionCookie) {
    return null
  }

  try {
    const session = JSON.parse(sessionCookie.value)

    // Check if session has expired
    if (new Date(session.expires) < new Date()) {
      await deleteSession()
      return null
    }

    return session
  } catch (error) {
    console.error("Failed to parse session:", error)
    return null
  }
}

export async function updateSession() {
  const session = await getSession()

  if (!session) {
    return null
  }

  // Update the expiration time
  const expires = new Date(Date.now() + SESSION_DURATION)
  session.expires = expires.toISOString()

  // Update the cookie
  const cookieStore = cookies()
  cookieStore.set("session", JSON.stringify(session), {
    httpOnly: true,
    expires,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  return session
}

export async function deleteSession() {
  const cookieStore = cookies()
  cookieStore.delete("session")
}
