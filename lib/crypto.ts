"use client"

// This file contains client-side encryption/decryption utilities
// using the Web Crypto API

/**
 * Derives an encryption key from a passkey
 */
async function deriveKey(passkey: string, salt?: Uint8Array): Promise<{ key: CryptoKey; salt: Uint8Array }> {
  // Generate a random salt if not provided
  if (!salt) {
    salt = crypto.getRandomValues(new Uint8Array(16))
  }

  // Convert passkey to a key using PBKDF2
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(passkey), { name: "PBKDF2" }, false, [
    "deriveBits",
    "deriveKey",
  ])

  // Derive the actual key
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  )

  return { key, salt }
}

/**
 * Encrypts data using a passkey
 */
export async function encryptData(data: string, passkey: string): Promise<string> {
  // Generate a random IV
  const iv = crypto.getRandomValues(new Uint8Array(12))

  // Derive key from passkey
  const { key, salt } = await deriveKey(passkey)

  // Encrypt the data
  const encoder = new TextEncoder()
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    encoder.encode(data),
  )

  // Combine the IV, salt, and encrypted data
  const encryptedArray = new Uint8Array(iv.length + salt.length + encryptedData.byteLength)
  encryptedArray.set(iv, 0)
  encryptedArray.set(salt, iv.length)
  encryptedArray.set(new Uint8Array(encryptedData), iv.length + salt.length)

  // Convert to base64 for storage
  return btoa(String.fromCharCode(...encryptedArray))
}

/**
 * Decrypts data using a passkey
 */
export async function decryptData(encryptedBase64: string, passkey: string): Promise<string> {
  // Convert from base64
  const encryptedString = atob(encryptedBase64)
  const encryptedArray = new Uint8Array(encryptedString.length)
  for (let i = 0; i < encryptedString.length; i++) {
    encryptedArray[i] = encryptedString.charCodeAt(i)
  }

  // Extract IV, salt, and encrypted data
  const iv = encryptedArray.slice(0, 12)
  const salt = encryptedArray.slice(12, 28)
  const encryptedData = encryptedArray.slice(28)

  // Derive key from passkey using the same salt
  const { key } = await deriveKey(passkey, salt)

  // Decrypt the data
  const decryptedData = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    encryptedData,
  )

  // Convert to string
  const decoder = new TextDecoder()
  return decoder.decode(decryptedData)
}
