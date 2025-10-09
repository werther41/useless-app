import { db } from "@/lib/db"

export async function GET() {
  try {
    // Example: Create a table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Example: Insert a user (ignore if already exists)
    const result = await db.execute({
      sql: "INSERT OR IGNORE INTO users (name, email) VALUES (?, ?)",
      args: ["John Doe", "john@example.com"],
    })

    // Example: Query users
    const users = await db.execute("SELECT * FROM users")

    return Response.json({
      success: true,
      data: users.rows,
      insertId: result.lastInsertRowid,
    })
  } catch (error) {
    console.error("Database error:", error)
    return Response.json(
      { success: false, error: "Database operation failed" },
      { status: 500 }
    )
  }
}
