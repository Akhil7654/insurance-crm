import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/pending",
  "/api/clerk-webhook",
  "/api/approve-user",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  if (!userId) {
    return auth().redirectToSignIn();
  }

  const approved = sessionClaims?.metadata?.approved;
  const role = sessionClaims?.metadata?.role;

  if (!approved && role !== "admin") {
    return NextResponse.redirect(new URL("/pending", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};