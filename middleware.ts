// middleware.ts - UPDATED WITH INSTANT GIGS ACCESS CONTROL
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// 1. Define route matchers
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/banned",
  "/unauthorized",
  "/dashboard/billing", // Allow access to pricing page
  "/api/webhooks/clerk", // Add webhook routes if needed
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

// 2. Define Instant Gigs protected routes
const isInstantGigsRoute = createRouteMatcher([
  "/hub/gigs(.*)", // All gigs hub routes
]);

export default clerkMiddleware(async (auth, request) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();
  const path = request.nextUrl.pathname;

  console.log("Middleware running for:", request.nextUrl.pathname);

  // 2. Skip middleware for public routes
  if (isPublicRoute(request)) {
    console.log("Public route:", request.nextUrl.pathname);
    // Redirect authenticated users away from auth pages
    if (
      userId &&
      (path.startsWith("/sign-in") || path.startsWith("/sign-up"))
    ) {
      return Response.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // 3. PROTECT ALL OTHER ROUTES
  if (!userId) {
    return redirectToSignIn();
  }

  // 4. Additional checks
  const { isBanned, role, tier, isInGracePeriod } =
    (sessionClaims?.metadata as any) || {};

  if (isBanned && path !== "/banned") {
    return Response.redirect(new URL("/banned", request.url));
  }

  // 5. Admin route checks
  if (isAdminRoute(request)) {
    if (role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
  }

  // 6. INSTANT GIGS ACCESS CONTROL - NEW SECTION
  if (isInstantGigsRoute(request)) {
    const userTier = tier || "free"; // Default to free if not set

    console.log("Instant Gigs route access check:", {
      path,
      userTier,
      isInGracePeriod,
      hasAccess: userTier !== "free" || isInGracePeriod,
    });

    // // Block free users who are NOT in grace period
    // if (userTier === "free" && !isInGracePeriod) {
    //   console.log("Blocking free user from Instant Gigs:", userId);

    //   // Redirect to upgrade page or show unauthorized
    //   return Response.redirect(
    //     new URL("/pricing?feature=instant-gigs", request.url)
    //   );
    // }
  }

  return NextResponse.next();
});

// 6. Matcher config
export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
