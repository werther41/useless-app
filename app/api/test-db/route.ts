import { NextRequest } from "next/server"

import { requireAdminAuth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  // Check admin authentication
  const authError = requireAdminAuth(request)
  if (authError) {
    return Response.json(authError, { status: authError.status })
  }

  try {
    // Test the connection by running a simple query
    const result = await db.execute("SELECT 1 as test")

    return Response.json({
      success: true,
      message: "Database connection successful!",
      data: result.rows,
    })
  } catch (error) {
    console.error("Database connection error:", error)
    return Response.json(
      {
        success: false,
        error: "Database connection failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
