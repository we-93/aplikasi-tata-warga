import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as any)?.role;

  // Paths
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isWebhookRoute = nextUrl.pathname.startsWith("/api/webhooks");
  const isAuthRoute = nextUrl.pathname.startsWith("/auth");
  const isPublicRoute = nextUrl.pathname === "/";
  const isCheckoutRoute = nextUrl.pathname.startsWith("/checkout");
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");

  if (isApiAuthRoute || isWebhookRoute) return NextResponse.next();

  if (isAuthRoute) {
    if (isLoggedIn) {
      if (role === "SUPER_ADMIN") return NextResponse.redirect(new URL("/admin", nextUrl));
      if (role === "TENANT_ADMIN" || role === "TENANT_STAFF") return NextResponse.redirect(new URL("/dashboard/rt", nextUrl));
    }
    return NextResponse.next();
  }

  if (isPublicRoute || isCheckoutRoute) {
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }

  if (isAdminRoute && role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/dashboard/rt", nextUrl));
  }

  if (isDashboardRoute && role === "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/admin", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
