import { NextRequest, NextResponse } from "next/server"

import { FactImport, importFacts } from "@/lib/import-facts"
import { initializeDatabase } from "@/lib/init-db"

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase()

    const body = await request.json()
    const { facts, skipDuplicates = true } = body

    if (!Array.isArray(facts)) {
      return NextResponse.json(
        { error: "Facts must be an array" },
        { status: 400 }
      )
    }

    const results = await importFacts(facts as FactImport[], skipDuplicates)

    return NextResponse.json({
      success: true,
      message: "Import completed",
      results,
    })
  } catch (error) {
    console.error("Error importing facts:", error)
    return NextResponse.json(
      { error: "Failed to import facts" },
      { status: 500 }
    )
  }
}
