import { NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    const adminSecret = process.env.ADMIN_SECRET

    if (!adminSecret) {
      return NextResponse.json(
        { error: "Admin authentication not configured" },
        { status: 500 }
      )
    }

    // Check for admin secret in query params
    const secretParam = request.nextUrl.searchParams.get("admin_secret")
    if (secretParam !== adminSecret) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message:
            "Admin authentication required. Add ?admin_secret=YOUR_SECRET to the URL",
        },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
