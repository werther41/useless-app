"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Building,
  Calendar,
  Code,
  Dices,
  FileText,
  Hash,
  Lightbulb,
  Loader2,
  MapPin,
  Microscope,
  Palette,
  Scale,
  Search,
  TrendingUp,
  User,
  X,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Topic {
  id: string
  text: string
  type: string
  occurrenceCount: number
  avgTfidfScore: number
  lastSeenAt: string
  combinedScore: number
}

interface TopicSelectorProps {
  onTopicsChange: (topics: string[]) => void
  maxSelection?: number
  className?: string
  enableSearch?: boolean
  enableDiversity?: boolean
}

// Icon mapping for entity types (updated for new types)
const getEntityIcon = (type: string) => {
  switch (type) {
    case "PERSON":
      return <User className="h-3 w-3" />
    case "ORG":
      return <Building className="h-3 w-3" />
    case "LOCATION":
      return <MapPin className="h-3 w-3" />
    case "PRODUCT":
      return <Hash className="h-3 w-3" />
    case "PROGRAMMING_LANGUAGE":
      return <Code className="h-3 w-3" />
    case "SCIENTIFIC_TERM":
      return <Microscope className="h-3 w-3" />
    case "FIELD_OF_STUDY":
      return <Lightbulb className="h-3 w-3" />
    case "EVENT":
      return <Calendar className="h-3 w-3" />
    case "WORK_OF_ART":
      return <Palette className="h-3 w-3" />
    case "LAW_OR_POLICY":
      return <Scale className="h-3 w-3" />
    // Legacy types for backward compatibility
    case "TECH":
      return <Hash className="h-3 w-3" />
    case "CONCEPT":
      return <Lightbulb className="h-3 w-3" />
    default:
      return <TrendingUp className="h-3 w-3" />
  }
}

// Color mapping for entity types (updated for new types with dark mode support)
const getEntityColor = (type: string) => {
  switch (type) {
    case "PERSON":
      return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800 dark:hover:bg-green-900/30"
    case "ORG":
      return "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800 dark:hover:bg-purple-900/30"
    case "LOCATION":
      return "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800 dark:hover:bg-orange-900/30"
    case "PRODUCT":
      return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/30"
    case "PROGRAMMING_LANGUAGE":
      return "bg-cyan-100 text-cyan-800 border-cyan-200 hover:bg-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800 dark:hover:bg-cyan-900/30"
    case "SCIENTIFIC_TERM":
      return "bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800 dark:hover:bg-indigo-900/30"
    case "FIELD_OF_STUDY":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800 dark:hover:bg-yellow-900/30"
    case "EVENT":
      return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800 dark:hover:bg-red-900/30"
    case "WORK_OF_ART":
      return "bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800 dark:hover:bg-pink-900/30"
    case "LAW_OR_POLICY":
      return "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200 dark:bg-slate-800/20 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800/30"
    // Legacy types for backward compatibility
    case "TECH":
      return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/30"
    case "CONCEPT":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800 dark:hover:bg-yellow-900/30"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 dark:bg-gray-800/20 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800/30"
  }
}

export function TopicSelector({
  onTopicsChange,
  maxSelection = 5,
  className = "",
  enableSearch = true,
  enableDiversity = true,
}: TopicSelectorProps) {
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Topic[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [isRandomizing, setIsRandomizing] = useState(false)

  // Fetch trending topics
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setIsLoading(true)
        setError("")

        const url = enableDiversity
          ? "/api/topics?limit=20&timeWindow=48&diverse=true"
          : "/api/topics?limit=20&timeWindow=48"

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`Failed to fetch topics: ${response.status}`)
        }

        const data = await response.json()
        setTopics(data.topics || [])
      } catch (err) {
        console.error("Error fetching topics:", err)
        setError(err instanceof Error ? err.message : "Failed to load topics")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTopics()
  }, [enableDiversity])

  // Search topics with debouncing
  const searchTopics = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    try {
      setIsSearching(true)
      const response = await fetch("/api/topics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          limit: 10,
        }),
      })

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`)
      }

      const data = await response.json()
      const searchTopics =
        data.suggestions?.map((suggestion: any) => ({
          id: `search_${suggestion.text}`,
          text: suggestion.text,
          type: suggestion.type,
          occurrenceCount: suggestion.count,
          avgTfidfScore: 0,
          lastSeenAt: new Date().toISOString(),
          combinedScore: suggestion.count,
        })) || []

      setSearchResults(searchTopics)
      setShowSearchResults(true)
    } catch (err) {
      console.error("Error searching topics:", err)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchTopics(searchQuery)
      } else {
        setSearchResults([])
        setShowSearchResults(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, searchTopics])

  const handleTopicToggle = (topicText: string) => {
    setSelectedTopics((prev) => {
      let newSelection: string[]

      if (prev.includes(topicText)) {
        // Remove topic
        newSelection = prev.filter((t) => t !== topicText)
      } else {
        // Add topic (if under limit)
        if (prev.length < maxSelection) {
          newSelection = [...prev, topicText]
        } else {
          // Replace oldest selection
          newSelection = [...prev.slice(1), topicText]
        }
      }

      onTopicsChange(newSelection)
      return newSelection
    })
  }

  const clearSelection = () => {
    setSelectedTopics([])
    onTopicsChange([])
  }

  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
    setShowSearchResults(false)
  }

  const randomizeTopics = async () => {
    try {
      setIsRandomizing(true)
      setError("")

      // Clear search if active
      if (showSearchResults) {
        clearSearch()
      }

      const url = enableDiversity
        ? `/api/topics?limit=20&timeWindow=48&diverse=true&_t=${Date.now()}`
        : `/api/topics?limit=20&timeWindow=48&_t=${Date.now()}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Failed to fetch topics: ${response.status}`)
      }

      const data = await response.json()
      setTopics(data.topics || [])
    } catch (err) {
      console.error("Error randomizing topics:", err)
      setError(
        err instanceof Error ? err.message : "Failed to randomize topics"
      )
    } finally {
      setIsRandomizing(false)
    }
  }

  // Get topics to display (search results or trending topics)
  const displayTopics = showSearchResults ? searchResults : topics

  if (isLoading) {
    return (
      <Card className={`border-primary/20 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading trending topics...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`border-red-200 ${className}`}>
        <CardContent className="p-4">
          <div className="text-center">
            <p className="mb-2 text-red-600">Failed to load topics</p>
            <p className="mb-3 text-sm text-muted-foreground">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (topics.length === 0 && !showSearchResults) {
    return (
      <Card className={`border-muted ${className}`}>
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            <TrendingUp className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p>No trending topics available</p>
            <p className="text-sm">Try again later or generate a random fact</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`border-primary/20 ${className}`}>
      <CardContent className="p-4">
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <TrendingUp className="h-5 w-5" />
              {showSearchResults ? "Search Results" : "Trending Topics"}
            </h3>
            <div className="flex items-center gap-2">
              {!showSearchResults && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={randomizeTopics}
                  disabled={isRandomizing}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {isRandomizing ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <Dices className="mr-1 h-4 w-4" />
                  )}
                  Randomize
                </Button>
              )}
              {showSearchResults && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="mr-1 h-4 w-4" />
                  Clear Search
                </Button>
              )}
              {selectedTopics.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="mr-1 h-4 w-4" />
                  Clear ({selectedTopics.length})
                </Button>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Search and select up to {maxSelection} topics to personalize your
            fact
            {selectedTopics.length > 0 &&
              ` (${selectedTopics.length}/${maxSelection} selected)`}
          </p>
        </div>

        {/* Search Input */}
        {enableSearch && (
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>
            {searchQuery && !isSearching && (
              <p className="mt-1 text-xs text-muted-foreground">
                {searchResults.length} result
                {searchResults.length !== 1 ? "s" : ""} found
              </p>
            )}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {displayTopics.map((topic) => {
              const isSelected = selectedTopics.includes(topic.text)
              const isDisabled =
                !isSelected && selectedTopics.length >= maxSelection

              return (
                <Badge
                  key={topic.id}
                  variant={isSelected ? "default" : "outline"}
                  className={`
                    flex cursor-pointer items-center gap-1 px-3 py-1.5 transition-all duration-200
                    ${
                      isSelected
                        ? "hover:bg-primary/90 bg-primary text-primary-foreground"
                        : isDisabled
                        ? "cursor-not-allowed opacity-50"
                        : getEntityColor(topic.type)
                    }
                  `}
                  onClick={() => !isDisabled && handleTopicToggle(topic.text)}
                >
                  {getEntityIcon(topic.type)}
                  <span className="font-medium">{topic.text}</span>
                  <span className="text-xs opacity-75">
                    ({topic.occurrenceCount})
                  </span>
                </Badge>
              )
            })}
          </div>

          {selectedTopics.length > 0 && (
            <div className="border-t pt-2">
              <p className="mb-2 text-sm text-muted-foreground">
                Selected topics:
              </p>
              <div className="flex flex-wrap gap-1">
                {selectedTopics.map((topic) => (
                  <Badge
                    key={topic}
                    variant="secondary"
                    className="bg-primary/10 hover:bg-primary/20 text-primary"
                  >
                    {topic}
                    <button
                      onClick={() => handleTopicToggle(topic)}
                      className="hover:bg-primary/20 ml-1 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
