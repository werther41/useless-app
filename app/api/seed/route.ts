import { NextRequest, NextResponse } from "next/server"

import { requireAdminAuth } from "@/lib/auth"
import { initializeDatabase } from "@/lib/init-db"
import { seedDatabase } from "@/lib/seed"

export async function POST(request: NextRequest) {
  // Check admin authentication
  const authError = requireAdminAuth(request)
  if (authError) {
    return NextResponse.json(authError, { status: authError.status })
  }

  try {
    await initializeDatabase()
    await seedDatabase()

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
    })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json(
      { error: "Failed to seed database" },
      { status: 500 }
    )
  }
}
