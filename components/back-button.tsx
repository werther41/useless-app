"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function BackButton() {
  const router = useRouter()
  return (
    <Button type="button" variant="outline" onClick={() => router.back()}>
      <div className="flex items-center gap-2">
        <ArrowLeft className="size-4" />
        Go Back
      </div>
    </Button>
  )
}
