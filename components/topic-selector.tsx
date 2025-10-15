"use client"

import { useEffect, useState } from "react"
import {
  Building,
  Calendar,
  Hash,
  Lightbulb,
  Loader2,
  MapPin,
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
}

// Icon mapping for entity types
const getEntityIcon = (type: string) => {
  switch (type) {
    case "TECH":
      return <Hash className="h-3 w-3" />
    case "ORG":
      return <Building className="h-3 w-3" />
    case "PERSON":
      return <User className="h-3 w-3" />
    case "LOCATION":
      return <MapPin className="h-3 w-3" />
    case "CONCEPT":
      return <Lightbulb className="h-3 w-3" />
    case "EVENT":
      return <Calendar className="h-3 w-3" />
    default:
      return <TrendingUp className="h-3 w-3" />
  }
}

// Color mapping for entity types
const getEntityColor = (type: string) => {
  switch (type) {
    case "TECH":
      return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200"
    case "ORG":
      return "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200"
    case "PERSON":
      return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
    case "LOCATION":
      return "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200"
    case "CONCEPT":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200"
    case "EVENT":
      return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
  }
}

export function TopicSelector({
  onTopicsChange,
  maxSelection = 5,
  className = "",
}: TopicSelectorProps) {
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")

  // Fetch trending topics
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setIsLoading(true)
        setError("")

        const response = await fetch("/api/topics?limit=20&timeWindow=48")

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
  }, [])

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

  if (topics.length === 0) {
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
              Trending Topics
            </h3>
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
          <p className="text-sm text-muted-foreground">
            Select up to {maxSelection} topics to personalize your fact
            {selectedTopics.length > 0 &&
              ` (${selectedTopics.length}/${maxSelection} selected)`}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => {
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
