import { db } from "./db"

/**
 * Execute a database query with retry logic and better error handling
 */
export async function executeWithRetry<T = any>(
  query: string,
  params: any[] = [],
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<{ rows: T[]; meta?: any }> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Database query attempt ${attempt}/${maxRetries}`)
      const result = await db.execute(query, params)
      return {
        rows: result.rows as T[],
        meta: (result as any).meta,
      }
    } catch (error) {
      lastError = error as Error
      console.error(`Database query attempt ${attempt} failed:`, error)

      // Check if it's a network-related error
      if (isNetworkError(error)) {
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1) // Exponential backoff
          console.log(`Retrying in ${delay}ms...`)
          await new Promise((resolve) => setTimeout(resolve, delay))
          continue
        }
      } else {
        // Non-network error, don't retry
        throw error
      }
    }
  }

  throw new Error(
    `Database query failed after ${maxRetries} attempts. Last error: ${lastError?.message}`
  )
}

/**
 * Check if an error is network-related
 */
function isNetworkError(error: any): boolean {
  if (!error) return false

  const errorMessage = error.message?.toLowerCase() || ""
  const errorCode = error.code || ""

  return (
    errorCode === "UND_ERR_SOCKET" ||
    errorCode === "ECONNRESET" ||
    errorCode === "ENOTFOUND" ||
    errorCode === "ETIMEDOUT" ||
    errorMessage.includes("socket") ||
    errorMessage.includes("connection") ||
    errorMessage.includes("network") ||
    errorMessage.includes("timeout") ||
    errorMessage.includes("fetch failed")
  )
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    await executeWithRetry("SELECT 1 as test", [], 1, 1000)
    return true
  } catch (error) {
    console.error("Database connection test failed:", error)
    return false
  }
}

/**
 * Get database connection status
 */
export async function getConnectionStatus(): Promise<{
  connected: boolean
  error?: string
  timestamp: string
}> {
  const startTime = Date.now()

  try {
    await executeWithRetry("SELECT 1 as test", [], 1, 1000)
    return {
      connected: true,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }
  }
}
