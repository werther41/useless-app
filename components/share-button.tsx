"use client"

import { Share2 } from "lucide-react"

import { Button } from "@/components/ui/button"

interface ShareButtonProps {
  factId: string
  factText: string
}

export function ShareButton({ factId, factText }: ShareButtonProps) {
  const shareUrl = `${
    process.env.NEXT_PUBLIC_BASE_URL || "https://useless-facts.vercel.app"
  }/facts/${factId}`

  const handleShare = async () => {
    const shareData = {
      title: "Useless Fact",
      text: factText,
      url: shareUrl,
    }

    try {
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(shareData)
      ) {
        await navigator.share(shareData)
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl)
        alert("Link copied to clipboard!")
      }
    } catch (error) {
      console.error("Error sharing:", error)
      // Final fallback
      try {
        await navigator.clipboard.writeText(shareUrl)
        alert("Link copied to clipboard!")
      } catch (clipboardError) {
        console.error("Error copying to clipboard:", clipboardError)
        alert("Unable to share. Please copy the URL manually.")
      }
    }
  }

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <Share2 className="h-4 w-4" />
      Share
    </Button>
  )
}
