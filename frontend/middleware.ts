import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export default async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  const isPublicPath = ["/login", "/signup"].some((path) =>
    pathname.startsWith(path),
  );
  const isAuthApiCall = pathname.startsWith("/api/auth/");

  if (isAuthApiCall || isPublicPath) {
    return NextResponse.next();
  }

  const session = await auth();

  if (!session) {
    console.warn("No session found. Redirecting to login...");
    return NextResponse.redirect(new URL("/login", origin));
  }

  const expiresAt = new Date(session.expires);
  const now = new Date();

  if (expiresAt <= now) {
    console.warn("Session expired. Redirecting to login...");
    return NextResponse.redirect(new URL("/login", origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/", "/profile/:path*", "/settings/:path*"],
};
