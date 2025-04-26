"use server"

import crypto from "crypto"

// In-memory storage
const users: Record<
  string,
  {
    passwordHash: string
    data: Record<string, any>
    loginAttempts: number
  }
> = {}

export const MAX_LOGIN_ATTEMPTS = 3

// Helper function to hash passwords
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

export async function registerUser(username: string, password: string) {
  // Check if user already exists
  if (users[username]) {
    return { success: false, message: "Username already exists" }
  }

  // Hash the password
  const passwordHash = hashPassword(password)

  // Create user
  users[username] = {
    passwordHash,
    data: {},
    loginAttempts: 0,
  }

  return { success: true, message: "User registered successfully" }
}

export async function validateLogin(username: string, password: string) {
  // Check if user exists
  if (!users[username]) {
    return { success: false, message: "Invalid username or password" }
  }

  // Check password
  const passwordHash = hashPassword(password)
  if (passwordHash !== users[username].passwordHash) {
    return { success: false, message: "Invalid username or password" }
  }

  return { success: true, message: "Login successful" }
}

export async function storeUserData(username: string, key: string, data: any) {
  // Check if user exists
  if (!users[username]) {
    return { success: false, message: "User not found" }
  }

  // Store data
  users[username].data[key] = data

  return { success: true, message: "Data stored successfully" }
}

export async function retrieveUserData(username: string, key: string) {
  // Check if user exists
  if (!users[username]) {
    return { success: false, message: "User not found" }
  }

  // Check if data exists
  if (!users[username].data[key]) {
    return { success: false, message: "Data not found" }
  }

  return { success: true, message: "Data retrieved successfully", data: users[username].data[key] }
}

export async function getUserData(username: string) {
  return users[username]
}

export async function incrementLoginAttempts(username: string) {
  if (users[username]) {
    users[username].loginAttempts += 1
  }
}

export async function getLoginAttempts(username: string) {
  return users[username]?.loginAttempts || 0
}

export async function resetLoginAttempts(username: string) {
  if (users[username]) {
    users[username].loginAttempts = 0
  }
}
