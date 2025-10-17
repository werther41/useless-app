import { NextRequest } from "next/server"

/**
 * Simple admin authentication middleware
 * In production, consider implementing proper authentication (OAuth, JWT, etc.)
 */
export function verifyAdminAuth(request: NextRequest): boolean {
  // Check for admin secret in environment
  const adminSecret = process.env.ADMIN_SECRET

  if (!adminSecret) {
    console.error("ADMIN_SECRET environment variable not set")
    return false
  }

  // Check Authorization header
  const authHeader = request.headers.get("authorization")
  if (authHeader === `Bearer ${adminSecret}`) {
    return true
  }

  // Check for admin secret in query params (for GET requests)
  const url = new URL(request.url)
  const secretParam = url.searchParams.get("admin_secret")
  if (secretParam === adminSecret) {
    return true
  }

  return false
}

/**
 * Middleware to protect admin routes
 */
export function requireAdminAuth(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return {
      error: "Unauthorized",
      message: "Admin authentication required",
      status: 401,
    }
  }
  return null
}
