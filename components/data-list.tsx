"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Key, Lock } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { retrieveData } from "@/lib/actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface DataListProps {
  dataKeys: string[]
}

export function DataList({ dataKeys }: DataListProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [passkey, setPasskey] = useState("")
  const [retrievedData, setRetrievedData] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)

  async function handleRetrieve() {
    if (!selectedKey) return

    setIsLoading(true)
    setError(null)
    setRetrievedData(null)

    try {
      const result = await retrieveData(selectedKey, passkey)
      if (result.success) {
        setRetrievedData(result.data)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset state when dialog closes
      setPasskey("")
      setRetrievedData(null)
      setError(null)
    }
  }

  if (dataKeys.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-gray-50 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">You haven't stored any data yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {dataKeys.map((key) => (
        <Card key={key} className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              {key}
            </CardTitle>
            <CardDescription>Encrypted data</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={open && selectedKey === key} onOpenChange={handleOpenChange}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full" onClick={() => setSelectedKey(key)}>
                  <Lock className="mr-2 h-4 w-4" />
                  Decrypt and View
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Decrypt Data: {key}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {retrievedData ? (
                    <>
                      <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>Data decrypted successfully!</AlertDescription>
                      </Alert>
                      <div className="space-y-2">
                        <Label>Decrypted Data</Label>
                        <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-800 whitespace-pre-wrap">
                          {retrievedData}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="passkey">Enter Passkey</Label>
                      <Input
                        id="passkey"
                        type="password"
                        placeholder="Enter the passkey for this data"
                        value={passkey}
                        onChange={(e) => setPasskey(e.target.value)}
                      />
                      <Button onClick={handleRetrieve} className="w-full mt-2" disabled={isLoading}>
                        {isLoading ? "Decrypting..." : "Decrypt Data"}
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
