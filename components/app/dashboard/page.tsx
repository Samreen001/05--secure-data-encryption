import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { DataList } from "@/components/data-list"
import { StoreDataForm } from "@/components/store-data-form"
import { getUserData } from "@/lib/storage"
import { LogoutButton } from "@/components/logout-button"

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const userData = await getUserData(session.username)
  const dataKeys = userData ? Object.keys(userData.data) : []

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold">Secure Storage Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Logged in as: {session.username}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 container px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold mb-4">Store New Data</h2>
            <StoreDataForm />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Your Stored Data</h2>
            <DataList dataKeys={dataKeys} />
          </div>
        </div>
      </main>
    </div>
  )
}
