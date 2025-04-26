"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createSession, deleteSession } from "@/lib/session"
import {
  registerUser,
  validateLogin,
  storeUserData,
  retrieveUserData,
  incrementLoginAttempts,
  getLoginAttempts,
  resetLoginAttempts,
  MAX_LOGIN_ATTEMPTS,
} from "@/lib/storage"
import { encryptData, decryptData } from "@/lib/crypto"

export async function register(username: string, password: string) {
  try {
    const result = await registerUser(username, password)
    return result
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, message: "Registration failed. Please try again." }
  }
}

export async function login(username: string, password: string) {
  try {
    // Check if user has too many failed attempts
    const attempts = await getLoginAttempts(username)
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      return { success: false, message: "Account locked due to too many failed attempts. Please try again later." }
    }

    const result = await validateLogin(username, password)

    if (result.success) {
      // Create session
      await createSession(username)
      // Reset login attempts
      await resetLoginAttempts(username)
      return { success: true }
    } else {
      // Increment failed login attempts
      await incrementLoginAttempts(username)
      const remainingAttempts = MAX_LOGIN_ATTEMPTS - (attempts + 1)

      return {
        success: false,
        message:
          remainingAttempts > 0
            ? `Invalid username or password. ${remainingAttempts} attempts remaining.`
            : "Account locked due to too many failed attempts. Please try again later.",
      }
    }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, message: "Login failed. Please try again." }
  }
}

export async function logout() {
  await deleteSession()
  redirect("/login")
}

export async function storeData(key: string, value: string, passkey: string) {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return { success: false, message: "Not authenticated. Please login again." }
    }

    const session = JSON.parse(sessionCookie.value)
    const username = session.username

    if (!username) {
      return { success: false, message: "Invalid session. Please login again." }
    }

    // Encrypt the data with the passkey
    const encryptedData = await encryptData(value, passkey)

    // Store the encrypted data
    const result = await storeUserData(username, key, encryptedData)
    return result
  } catch (error) {
    console.error("Store data error:", error)
    return { success: false, message: "Failed to store data. Please try again." }
  }
}

export async function retrieveData(key: string, passkey: string) {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return { success: false, message: "Not authenticated. Please login again." }
    }

    const session = JSON.parse(sessionCookie.value)
    const username = session.username

    if (!username) {
      return { success: false, message: "Invalid session. Please login again." }
    }

    // Retrieve the encrypted data
    const result = await retrieveUserData(username, key)

    if (!result.success) {
      return result
    }

    try {
      // Try to decrypt the data with the provided passkey
      const decryptedData = await decryptData(result.data, passkey)
      return { success: true, message: "Data retrieved successfully", data: decryptedData }
    } catch (error) {
      // Increment failed attempts
      await incrementLoginAttempts(username)
      const attempts = await getLoginAttempts(username)
      const remainingAttempts = MAX_LOGIN_ATTEMPTS - attempts

      if (remainingAttempts <= 0) {
        // Force logout if too many failed attempts
        await deleteSession()
        return { success: false, message: "Too many failed attempts. You have been logged out." }
      }

      return {
        success: false,
        message: `Incorrect passkey. ${remainingAttempts} attempts remaining before logout.`,
      }
    }
  } catch (error) {
    console.error("Retrieve data error:", error)
    return { success: false, message: "Failed to retrieve data. Please try again." }
  }
}
