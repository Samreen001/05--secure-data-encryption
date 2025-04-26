"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { storeData } from "@/lib/actions"

export function StoreDataForm() {
  const router = useRouter()
  const [key, setKey] = useState("")
  const [value, setValue] = useState("")
  const [passkey, setPasskey] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await storeData(key, value, passkey)
      if (result.success) {
        setSuccess("Data stored successfully!")
        setKey("")
        setValue("")
        setPasskey("")
        router.refresh()
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="key">Data Key</Label>
        <Input
          id="key"
          placeholder="Enter a name for your data"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="value">Data Value</Label>
        <Textarea
          id="value"
          placeholder="Enter the data you want to store"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={4}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="passkey">Encryption Passkey</Label>
        <Input
          id="passkey"
          type="password"
          placeholder="Enter a passkey to encrypt this data"
          value={passkey}
          onChange={(e) => setPasskey(e.target.value)}
          required
        />
        <p className="text-xs text-gray-500">Remember this passkey! You'll need it to decrypt your data later.</p>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Storing..." : "Store Data"}
      </Button>
    </form>
  )
}
