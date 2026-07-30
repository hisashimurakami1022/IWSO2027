import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const PUBLIC_PREFIXES = ["/login", "/verify-request", "/program", "/help", "/api/auth"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname === "/" || PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const isLoggedIn = !!req.auth;
  const roles = req.auth?.user?.roles ?? [];

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin") && !roles.includes("CHAIR")) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  if (
    pathname.startsWith("/review") &&
    !roles.includes("REVIEWER") &&
    !roles.includes("CHAIR")
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
