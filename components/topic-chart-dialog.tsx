"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TopicBubbleChart } from "@/components/topic-bubble-chart"

interface Topic {
  id: string
  text: string
  type: string
  occurrenceCount: number
  avgTfidfScore: number
  lastSeenAt: string
  combinedScore: number
}

interface TopicChartDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (topics: string[]) => void
  maxSelection?: number
  initialSelectedTopics?: string[]
}

export function TopicChartDialog({
  open,
  onOpenChange,
  onConfirm,
  maxSelection = 5,
  initialSelectedTopics = [],
}: TopicChartDialogProps) {
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize selected topics from props
  useEffect(() => {
    if (open) {
      setSelectedTopics(initialSelectedTopics)
    }
  }, [open, initialSelectedTopics])

  const fetchTopics = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch topics for visualization
      const response = await fetch(
        `/api/topics?limit=180&timeWindow=168&diverse=true&cache_bust=${Date.now()}`,
        {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.error || `Failed to fetch topics: ${response.status}`
        )
      }

      const data = await response.json()
      setTopics(data.topics || [])
    } catch (err) {
      console.error("Error fetching topics for chart:", err)
      setError(
        err instanceof Error ? err.message : "Failed to load topics for chart"
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch topics when dialog opens
  useEffect(() => {
    if (open) {
      fetchTopics()
    }
  }, [open, fetchTopics])

  const handleTopicSelect = useCallback(
    (topicText: string) => {
      setSelectedTopics((prev) => {
        if (prev.includes(topicText)) {
          // Deselect
          return prev.filter((t) => t !== topicText)
        } else {
          // Select (if under limit)
          if (prev.length < maxSelection) {
            return [...prev, topicText]
          }
          // If at limit, replace oldest selection
          return [...prev.slice(1), topicText]
        }
      })
    },
    [maxSelection]
  )

  const handleConfirm = () => {
    onConfirm(selectedTopics)
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Explore Trending Topics</DialogTitle>
          <DialogDescription>
            Click on bubbles to select topics. X-axis shows freshness, Y-axis
            shows uniqueness, bubble size shows popularity, and color indicates
            topic type. Select up to {maxSelection} topics.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading && (
            <div className="flex h-[500px] items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Loading topics...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {!isLoading && !error && topics.length > 0 && (
            <>
              <TopicBubbleChart
                topics={topics}
                selectedTopics={selectedTopics}
                onTopicSelect={handleTopicSelect}
                maxSelection={maxSelection}
              />

              {selectedTopics.length > 0 && (
                <div className="bg-muted/50 rounded-md border p-4">
                  <p className="mb-2 text-sm font-medium">
                    Selected topics ({selectedTopics.length}/{maxSelection}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTopics.map((topic) => (
                      <Badge
                        key={topic}
                        variant="secondary"
                        className="bg-primary/10 hover:bg-primary/20 text-primary"
                      >
                        {topic}
                        <button
                          onClick={() => handleTopicSelect(topic)}
                          className="hover:bg-primary/20 ml-1.5 rounded-full p-0.5"
                          aria-label={`Remove ${topic}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedTopics.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  Click on bubbles to select topics
                </p>
              )}
            </>
          )}

          {!isLoading && !error && topics.length === 0 && (
            <div className="flex h-[500px] items-center justify-center">
              <p className="text-sm text-muted-foreground">
                No topics available to display
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedTopics.length === 0}
          >
            Confirm ({selectedTopics.length}/{maxSelection})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
