import { NextRequest, NextResponse } from "next/server";

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Public financial demo — no login required
  if (pathname === "/demo" || pathname.startsWith("/demo/")) {
    return NextResponse.next();
  }

  // All other routes remain protected
  const username = process.env.DEMO_USERNAME;
  const password = process.env.DEMO_PASSWORD;

  if (!username || !password || password.length < 20) {
    return new NextResponse("Authentication not configured", {
      status: 503,
    });
  }

  const authorization = request.headers.get("authorization");

  if (authorization?.startsWith("Basic ")) {
    try {
      const credentials = atob(authorization.slice(6));

      if (credentials === `${username}:${password}`) {
        return NextResponse.next();
      }
    } catch {
      // Invalid credentials
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="MyPortfolio Demo"',
      "Cache-Control": "no-store",
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
