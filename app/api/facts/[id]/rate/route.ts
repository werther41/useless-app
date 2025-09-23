import { NextRequest, NextResponse } from "next/server"

import { rateFact } from "@/lib/facts"
import { ratingSchema } from "@/lib/validation"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { rating } = ratingSchema.parse(body)

    const userIp =
      request.ip ||
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown"

    const factRating = await rateFact(params.id, rating, userIp)

    return NextResponse.json({
      success: true,
      data: factRating,
      message: "Rating submitted successfully",
    })
  } catch (error) {
    console.error("Error rating fact:", error)

    if (error instanceof Error && error.message.includes("validation")) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: "Failed to submit rating" },
      { status: 500 }
    )
  }
}
