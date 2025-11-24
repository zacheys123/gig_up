// middleware.ts - SIMPLIFIED VERSION
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/banned",
  "/unauthorized",
  "/contact",
  "/faq",
  "/terms",
  "/privacy",
  "/api/webhooks/clerk",
];

const isPublicRoute = createRouteMatcher(PUBLIC_ROUTES);

export default clerkMiddleware(async (auth, request) => {
  const { userId, redirectToSignIn } = await auth();
  const path = request.nextUrl.pathname;

  console.log("🛡️ Middleware protecting:", path);

  // Skip middleware for public routes
  if (isPublicRoute(request)) {
    console.log("✅ Public route - allowing access");

    // Redirect authenticated users away from auth pages
    if (
      userId &&
      (path.startsWith("/sign-in") || path.startsWith("/sign-up"))
    ) {
      console.log("🔄 Redirecting authenticated user from auth pages");
      return Response.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  // PROTECT ALL OTHER ROUTES - This prevents manual URL access
  if (!userId) {
    console.log("❌ No user ID - redirecting to sign in");
    return redirectToSignIn();
  }

  // All authenticated users can access protected routes
  // (Admin logic removed for now)
  console.log("✅ Authenticated user - allowing access to:", path);

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
