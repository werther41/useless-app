"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Clock, Filter, Loader2, Search, TrendingUp } from "lucide-react"

import { ArticleWithRelevance } from "@/lib/schema"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArticleList } from "@/components/article-list"
import { TopicSelector } from "@/components/topic-selector"

type SearchMode = "topic" | "text"
type TimeFilter = "24h" | "7d" | "30d" | "all"
type SortBy = "time" | "score"

interface SearchState {
  mode: SearchMode
  topics: string[]
  timeFilter: TimeFilter
  sortBy: SortBy
  textQuery: string
  articles: ArticleWithRelevance[]
  isLoading: boolean
  error: string | null
}

const TIME_FILTER_OPTIONS = [
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All time" },
] as const

export default function DiscoverPage() {
  const [searchState, setSearchState] = useState<SearchState>({
    mode: "topic",
    topics: [],
    timeFilter: "7d",
    sortBy: "score",
    textQuery: "",
    articles: [],
    isLoading: false,
    error: null,
  })

  // Debounced text search
  const [debouncedQuery, setDebouncedQuery] = useState("")

  // Ref to track if we should trigger search on sort change
  const shouldTriggerSearch = useRef(false)

  const performTextSearch = useCallback(
    async (query: string) => {
      setSearchState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        const params = new URLSearchParams({
          q: query,
          timeFilter: searchState.timeFilter,
        })

        const response = await fetch(`/api/articles/search?${params}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to search articles")
        }

        const data = await response.json()
        setSearchState((prev) => ({
          ...prev,
          articles: data.articles,
          isLoading: false,
          error: null,
        }))
      } catch (error) {
        console.error("Error searching articles:", error)
        setSearchState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to search articles",
        }))
      }
    },
    [searchState.timeFilter]
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchState.textQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchState.textQuery])

  // Perform text search when debounced query changes
  useEffect(() => {
    if (searchState.mode === "text" && debouncedQuery.length >= 3) {
      performTextSearch(debouncedQuery)
    }
  }, [debouncedQuery, searchState.mode, performTextSearch])

  const performTopicSearch = useCallback(async () => {
    if (searchState.topics.length === 0) {
      setSearchState((prev) => ({
        ...prev,
        error: "Please select at least one topic",
      }))
      return
    }

    setSearchState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const params = new URLSearchParams({
        topics: searchState.topics.join(","),
        timeFilter: searchState.timeFilter,
        sortBy: searchState.sortBy,
      })

      const response = await fetch(`/api/articles?${params}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to search articles")
      }

      const data = await response.json()
      setSearchState((prev) => ({
        ...prev,
        articles: data.articles,
        isLoading: false,
        error: null,
      }))
    } catch (error) {
      console.error("Error searching articles:", error)
      setSearchState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to search articles",
      }))
    }
  }, [searchState.topics, searchState.timeFilter, searchState.sortBy])

  const handleModeChange = (mode: SearchMode) => {
    setSearchState((prev) => ({
      ...prev,
      mode,
      articles: [],
      error: null,
    }))
  }

  const handleTopicsChange = (topics: string[]) => {
    setSearchState((prev) => ({ ...prev, topics }))
  }

  const handleTimeFilterChange = (timeFilter: TimeFilter) => {
    setSearchState((prev) => ({ ...prev, timeFilter }))
  }

  const handleSortChange = (sortBy: SortBy) => {
    setSearchState((prev) => ({ ...prev, sortBy }))
    shouldTriggerSearch.current = true
  }

  // Auto-search when sort changes (if we have articles)
  useEffect(() => {
    if (shouldTriggerSearch.current) {
      shouldTriggerSearch.current = false
      if (searchState.mode === "topic" && searchState.topics.length > 0) {
        performTopicSearch()
      } else if (
        searchState.mode === "text" &&
        searchState.textQuery.length >= 3
      ) {
        performTextSearch(searchState.textQuery)
      }
    }
  }, [
    searchState.sortBy,
    searchState.mode,
    searchState.topics.length,
    searchState.textQuery,
    performTopicSearch,
    performTextSearch,
  ])

  const handleTextQueryChange = (textQuery: string) => {
    setSearchState((prev) => ({ ...prev, textQuery }))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Article Discovery</h1>
        <p className="mt-2 text-muted-foreground">
          Search news articles by topics or free-text queries with advanced
          filtering
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Search Controls */}
        <div className="lg:col-span-1">
          <div className="space-y-4">
            {/* Search Mode Toggle - Tab Style */}
            <div className="flex justify-center p-1">
              <div className="border-primary/20 border-1 inline-flex gap-1 rounded-full bg-card p-1">
                <Button
                  variant={searchState.mode === "topic" ? "outline" : "ghost"}
                  onClick={() => handleModeChange("topic")}
                  size="lg"
                  className={`border-color-primary flex items-center gap-1.5 rounded-full px-3 py-2 text-base font-medium hover:bg-transparent hover:text-inherit sm:gap-2 sm:px-6 sm:py-3 sm:text-lg ${
                    searchState.mode === "topic"
                      ? "text-foreground"
                      : "text-foreground opacity-50"
                  }`}
                >
                  <TrendingUp className="h-4 w-4 text-primary sm:size-6" />
                  <span className="whitespace-nowrap">By Topics</span>
                </Button>
                <Button
                  variant={searchState.mode === "text" ? "outline" : "ghost"}
                  onClick={() => handleModeChange("text")}
                  size="lg"
                  className={`border-color-primary flex items-center gap-1.5 rounded-full px-3 py-2 text-base font-medium hover:bg-transparent hover:text-inherit sm:gap-2 sm:px-6 sm:py-3 sm:text-lg ${
                    searchState.mode === "text"
                      ? "text-foreground"
                      : "text-foreground opacity-50"
                  }`}
                >
                  <Search className="h-4 w-4 text-primary sm:size-6" />
                  <span className="whitespace-nowrap">Free Text</span>
                </Button>
              </div>
            </div>

            {/* Topic-Based Search */}
            {searchState.mode === "topic" && (
              <>
                <TopicSelector
                  onTopicsChange={handleTopicsChange}
                  maxSelection={5}
                  enableSearch={true}
                  enableDiversity={true}
                  enableTopicTypeFilter={true}
                />
              </>
            )}

            {/* Free-Text Search */}
            {searchState.mode === "text" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Search Query</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Enter your search query..."
                      value={searchState.textQuery}
                      onChange={(e) => handleTextQueryChange(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    {searchState.isLoading && (
                      <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  {searchState.textQuery.length > 0 &&
                    searchState.textQuery.length < 3 && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Enter at least 3 characters to search
                      </p>
                    )}
                </CardContent>
              </Card>
            )}

            {/* Time Filter & Sort - Compact */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Time Range
                </label>
                <select
                  value={searchState.timeFilter}
                  onChange={(e) =>
                    handleTimeFilterChange(e.target.value as TimeFilter)
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {TIME_FILTER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Sort By
                </label>
                <select
                  value={searchState.sortBy}
                  onChange={(e) => handleSortChange(e.target.value as SortBy)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="score">Most Relevant</option>
                  <option value="time">Most Recent</option>
                </select>
              </div>
            </div>

            {/* Search Button for Topic Mode */}
            {searchState.mode === "topic" && (
              <Button
                onClick={performTopicSearch}
                disabled={
                  searchState.isLoading || searchState.topics.length === 0
                }
                className="w-full"
              >
                {searchState.isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Search Articles
              </Button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {/* Error Display */}
          {searchState.error && (
            <Card className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
              <CardContent className="p-4">
                <p className="text-red-600 dark:text-red-400">
                  {searchState.error}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Active Filters Display */}
          {(searchState.topics.length > 0 || searchState.textQuery) && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Active filters:
                  </span>

                  {searchState.mode === "topic" &&
                    searchState.topics.map((topic) => (
                      <Badge key={topic} variant="secondary">
                        {topic}
                      </Badge>
                    ))}

                  {searchState.mode === "text" && searchState.textQuery && (
                    <Badge variant="secondary">
                      &ldquo;{searchState.textQuery}&rdquo;
                    </Badge>
                  )}

                  <Badge variant="outline">
                    <Clock className="mr-1 w-3 h-3" />
                    {
                      TIME_FILTER_OPTIONS.find(
                        (opt) => opt.value === searchState.timeFilter
                      )?.label
                    }
                  </Badge>

                  <Badge variant="outline">
                    <Filter className="mr-1 w-3 h-3" />
                    {searchState.sortBy === "score"
                      ? "Most Relevant"
                      : "Most Recent"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          <ArticleList
            articles={searchState.articles}
            isLoading={searchState.isLoading}
            sortBy={searchState.sortBy}
            onSortChange={handleSortChange}
          />
        </div>
      </div>
    </div>
  )
}
