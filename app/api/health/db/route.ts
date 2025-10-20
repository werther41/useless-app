import { NextResponse } from "next/server"

import { getConnectionStatus } from "@/lib/db-utils"

export async function GET() {
  try {
    const status = await getConnectionStatus()

    return NextResponse.json(
      {
        status: status.connected ? "healthy" : "unhealthy",
        database: status,
        timestamp: new Date().toISOString(),
      },
      {
        status: status.connected ? 200 : 503,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    )
  } catch (error) {
    console.error("Health check failed:", error)

    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    )
  }
}
