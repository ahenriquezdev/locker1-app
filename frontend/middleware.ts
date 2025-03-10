import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function middleware(req: NextRequest) {
  const sessionToken = req.cookies.get("authjs.session-token")?.value;

  if (
    (req.nextUrl.pathname.startsWith("/dashboard") && !sessionToken) ||
    ((req.nextUrl.pathname.startsWith("/login") ||
      req.nextUrl.pathname.startsWith("/signup") ||
      req.nextUrl.pathname === "/") &&
      sessionToken)
  ) {
    const redirectUrl = sessionToken ? "/dashboard" : "/login";
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/", "/login", "/signup"],
};
