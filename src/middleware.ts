import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  // Fix duplicate headers from Cloudflare + OpenLiteSpeed
  const xForwardedHost = req.headers.get("x-forwarded-host");
  if (xForwardedHost && xForwardedHost.includes(",")) {
    req.headers.set("x-forwarded-host", xForwardedHost.split(",")[0].trim());
  }
  
  const origin = req.headers.get("origin");
  if (origin && origin.includes(",")) {
    req.headers.set("origin", origin.split(",")[0].trim());
  }

  const xForwardedProto = req.headers.get("x-forwarded-proto");
  if (xForwardedProto && xForwardedProto.includes(",")) {
    req.headers.set("x-forwarded-proto", xForwardedProto.split(",")[0].trim());
  }

  const hostHeader = req.headers.get("host");
  if (hostHeader && hostHeader.includes(",")) {
    req.headers.set("host", hostHeader.split(",")[0].trim());
  }

  const { nextUrl } = req;
  
  // Force HTTPS in production to prevent HTTP redirect loops behind proxies
  if (process.env.NODE_ENV === "production" || nextUrl.hostname !== "localhost") {
    nextUrl.protocol = "https:";
  }

  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as any)?.role;

  // Paths
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isWebhookRoute = nextUrl.pathname.startsWith("/api/webhooks");
  const isAuthRoute = nextUrl.pathname.startsWith("/auth");
  const isPublicRoute = ["/", "/privacy", "/terms"].includes(nextUrl.pathname);
  const isCheckoutRoute = nextUrl.pathname.startsWith("/checkout");
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");

  if (isApiAuthRoute || isWebhookRoute) return NextResponse.next({ request: { headers: req.headers } });

  if (isAuthRoute) {
    if (isLoggedIn) {
      if (role === "SUPER_ADMIN") return NextResponse.redirect(new URL("/admin", nextUrl));
      if (role === "TENANT_ADMIN" || role === "TENANT_STAFF") return NextResponse.redirect(new URL("/dashboard/rt", nextUrl));
    }
    return NextResponse.next({ request: { headers: req.headers } });
  }

  if (isPublicRoute || isCheckoutRoute) {
    return NextResponse.next({ request: { headers: req.headers } });
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

  return NextResponse.next({ request: { headers: req.headers } });
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
