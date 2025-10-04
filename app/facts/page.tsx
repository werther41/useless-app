"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

type ApiResponse = {
  success: boolean
  data: Fact[]
  pagination: {
    page: number
    limit: number
    total: number
  }
  error?: string
}

export default function AllFactsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const page = useMemo(() => {
    const p = Number(searchParams.get("page") || 1)
    return Number.isFinite(p) && p > 0 ? p : 1
  }, [searchParams])

  const limit = useMemo(() => {
    const l = Number(searchParams.get("limit") || 10)
    if (!Number.isFinite(l)) return 10
    return Math.min(Math.max(l, 1), 100)
  }, [searchParams])

  const [facts, setFacts] = useState<Fact[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const timestamp = Date.now()
        const resp = await fetch(
          `/api/facts?page=${page}&limit=${limit}&t=${timestamp}`,
          { cache: "no-store", signal: controller.signal }
        )
        if (!resp.ok) throw new Error("Failed to load facts")
        const json: ApiResponse = await resp.json()
        if (!json.success) throw new Error(json.error || "Failed to load facts")
        if (isMounted) {
          setFacts(json.data)
        }
      } catch (err: any) {
        if (err?.name === "AbortError") return
        setError(err?.message || "Unexpected error")
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    load()
    return () => {
      isMounted = false
      controller.abort()
    }
  }, [page, limit])

  const goToPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(nextPage))
    params.set("limit", String(limit))
    router.push(`${pathname}?${params.toString()}`)
  }

  const canGoPrev = page > 1
  const canGoNext = facts.length >= limit // if we received less than limit, likely last page

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
          <div className="mb-6 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page <span className="font-semibold">{page}</span>
            </div>
            <div>
              <Link
                href={pathname}
                className="text-sm text-primary underline underline-offset-4 hover:text-primary/80"
                prefetch
              >
                Reset filters
              </Link>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-destructive">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {isLoading && facts.length === 0 && (
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">Loading facts…</p>
                </CardContent>
              </Card>
            )}

            {!isLoading && facts.length === 0 && !error && (
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">No facts found.</p>
                </CardContent>
              </Card>
            )}

            {facts.map((fact) => (
              <Card key={fact.id} className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-xl leading-relaxed">
                    {fact.text}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span>
                      Rating: <span className="font-semibold">{fact.total_rating}</span>
                    </span>
                    <span>
                      Votes: <span className="font-semibold">{fact.rating_count}</span>
                    </span>
                    {fact.source && (
                      <span className="truncate">Source: {fact.source}</span>
                    )}
                    {/* Source URL link removed as requested */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="mt-8 flex items-center justify-between">
            <Button
              onClick={() => goToPage(page - 1)}
              variant="outline"
              disabled={!canGoPrev}
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <div className="text-sm text-muted-foreground">Page {page}</div>
            <Button
              onClick={() => goToPage(page + 1)}
              variant="outline"
              disabled={!canGoNext || isLoading}
            >
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Footer link back */}
          <div className="mt-8 text-center text-sm">
            <Link
              href="/"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              Back to home
            </Link>
          </div>
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
