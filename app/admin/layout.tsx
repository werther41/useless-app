import Link from "next/link"
import { ArrowLeft, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b border-border backdrop-blur">
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to App
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                <h1 className="text-xl font-semibold">Admin Panel</h1>
              </div>
            </div>

            <nav className="flex items-center gap-4">
              <Link href="/admin/import">
                <Button variant="outline" size="sm">
                  Import Facts
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="container mx-auto">{children}</main>
    </div>
  )
}
