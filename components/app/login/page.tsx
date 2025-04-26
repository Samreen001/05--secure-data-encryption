import { LoginForm } from "@/components/login-form"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"

export default async function LoginPage() {
  const session = await getSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Login</h1>
          <p className="text-gray-500 dark:text-gray-400">Enter your credentials to access your secure storage</p>
        </div>
        <LoginForm />
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  )
}
