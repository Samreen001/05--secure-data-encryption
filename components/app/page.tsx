import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default async function Home() {
  const session = await getSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Secure Data Storage System
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Store and retrieve your sensitive data with passkey protection. Your data never leaves your browser.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/login">
                  <Button>
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Passkey Protection</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Each piece of data is encrypted with a unique passkey that only you know.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">In-Memory Storage</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Your data is stored securely in memory and never persisted to a database.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Enhanced Security</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Multiple failed attempts result in automatic logout for maximum security.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Secure Storage System. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
