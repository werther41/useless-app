import { BookOpen } from "lucide-react"

import { getAllFacts } from "@/lib/facts"
import { Badge } from "@/components/ui/badge"
import FactsList from "@/components/facts-list"

type Fact = {
  id: string
  text: string
  source?: string | null
  source_url?: string | null
  created_at: string
  updated_at: string
  total_rating: number
  rating_count: number
  user_rating?: number | null
}

interface AllFactsPageProps {
  searchParams: {
    page?: string
    limit?: string
  }
}

export default async function AllFactsPage({
  searchParams,
}: AllFactsPageProps) {
  const page = Number(searchParams.page || 1)
  const limit = Math.min(Math.max(Number(searchParams.limit || 50), 1), 100)

  // Fetch initial data server-side
  const initialFacts = await getAllFacts(page, limit)

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <Badge variant="outline" className="px-3 py-1 text-sm">
              Browse All Facts
            </Badge>
          </div>
          <h1 className="mb-3 text-4xl font-bold text-foreground">All Facts</h1>
          <p className="text-pretty text-lg text-muted-foreground">
            Explore our entire collection of useless facts. Use the pagination
            controls to navigate through pages.
          </p>
        </div>
      </section>

      {/* Facts List */}
      <section className="px-4 pb-8">
        <div className="container mx-auto max-w-4xl">
          <FactsList
            initialFacts={initialFacts}
            initialPage={page}
            initialLimit={limit}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-12">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-muted-foreground">
            © 2024 Useless Facts. Making the world slightly more informed about
            completely irrelevant things.
          </p>
        </div>
      </footer>
    </div>
  )
}
