"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"

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

interface FactsListProps {
  initialFacts: Fact[]
  initialPage: number
  initialLimit: number
}

export default function FactsList({
  initialFacts,
  initialPage,
  initialLimit,
}: FactsListProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const page = useMemo(() => {
    const p = Number(searchParams.get("page") || initialPage)
    return Number.isFinite(p) && p > 0 ? p : initialPage
  }, [searchParams, initialPage])

  const limit = useMemo(() => {
    const l = Number(searchParams.get("limit") || initialLimit)
    if (!Number.isFinite(l)) return initialLimit
    return Math.min(Math.max(l, 1), 100)
  }, [searchParams, initialLimit])

  const [facts, setFacts] = useState<Fact[]>(initialFacts)
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

    // Only fetch if page or limit changed from initial values
    if (page !== initialPage || limit !== initialLimit) {
      load()
    }

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [page, limit, initialPage, initialLimit])

  const goToPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(nextPage))
    params.set("limit", String(limit))
    router.push(`${pathname}?${params.toString()}`)
  }

  const canGoPrev = page > 1
  const canGoNext = facts.length >= limit // if we received less than limit, likely last page

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page <span className="font-semibold">{page}</span>
        </div>
        <div>
          <Link
            href={pathname}
            className="hover:text-primary/80 text-sm text-primary underline underline-offset-4"
            prefetch
          >
            Reset filters
          </Link>
        </div>
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 mb-6 rounded-md border p-4 text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {isLoading && facts.length === 0 && (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                Loading facts…
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && facts.length === 0 && !error && (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                No facts found.
              </p>
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
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span>
                    Rating:{" "}
                    <span className="font-semibold">{fact.total_rating}</span>
                  </span>
                  <span>
                    Votes:{" "}
                    <span className="font-semibold">{fact.rating_count}</span>
                  </span>
                  {fact.source && (
                    <span className="truncate">Source: {fact.source}</span>
                  )}
                </div>
                {/* Why It's Interesting */}
                {(fact as any).why_interesting && (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <p className="mb-1 text-xs font-semibold text-primary">
                      Why it&apos;s interesting:
                    </p>
                    <p className="text-xs text-foreground">
                      {(fact as any).why_interesting}
                    </p>
                  </div>
                )}
                {/* Source Snippet */}
                {(fact as any).source_snippet && (
                  <div className="rounded-lg border border-muted bg-muted/30 p-3">
                    <p className="mb-1 text-xs font-semibold text-muted-foreground">
                      Source snippet:
                    </p>
                    <p className="text-xs italic text-muted-foreground">
                      &quot;{(fact as any).source_snippet}&quot;
                    </p>
                  </div>
                )}
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
          className="hover:text-primary/80 text-primary underline underline-offset-4"
        >
          Back to home
        </Link>
      </div>
    </>
  )
}
