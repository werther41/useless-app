"use client"

import { useState } from "react"
import { ThumbsDown, ThumbsUp } from "lucide-react"

import { Button } from "@/components/ui/button"

interface FactRatingButtonsProps {
  factId: string
  userRating?: number | null
  onRatingChange?: (rating: number) => void
}

export function FactRatingButtons({
  factId,
  userRating,
  onRatingChange,
}: FactRatingButtonsProps) {
  const [isRating, setIsRating] = useState(false)

  const rateFact = async (rating: number) => {
    if (userRating || isRating) return

    setIsRating(true)
    try {
      const response = await fetch(`/api/facts/${factId}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating }),
      })

      if (response.ok) {
        onRatingChange?.(rating)
      }
    } catch (error) {
      console.error("Error rating fact:", error)
    } finally {
      setIsRating(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
      <Button
        onClick={() => rateFact(1)}
        disabled={!!userRating || isRating}
        variant={userRating === 1 ? "default" : "outline"}
        size="lg"
        className={`flex w-full items-center justify-center gap-2 whitespace-nowrap sm:w-auto ${
          userRating === 1
            ? "bg-green-600 text-white"
            : "border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
        } disabled:bg-muted disabled:text-muted-foreground`}
      >
        <ThumbsUp className="h-5 w-5" />
        Useful Uselessness
      </Button>
      <Button
        onClick={() => rateFact(-1)}
        disabled={!!userRating || isRating}
        variant={userRating === -1 ? "default" : "outline"}
        size="lg"
        className={`flex w-full items-center justify-center gap-2 whitespace-nowrap sm:w-auto ${
          userRating === -1
            ? "bg-red-600 text-white"
            : "border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
        } disabled:bg-muted disabled:text-muted-foreground`}
      >
        <ThumbsDown className="h-5 w-5" />
        Too Useless
      </Button>
    </div>
  )
}
