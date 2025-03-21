import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth, signOut } from "@/lib/auth";

export default async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  const session = await auth();

  if (
    !session &&
    !req.nextUrl.pathname.startsWith("/login") &&
    !req.nextUrl.pathname.startsWith("/signup")
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (
    session &&
    session.expiresAt &&
    session.expiresAt < Math.floor(Date.now() / 1000)
  ) {
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.set("authjs.session-token", "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/", "/login", "/signup"],
};
