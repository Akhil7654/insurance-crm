import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/pending",
  "/api/clerk-webhook",
  "/api/approve-user",
  "/api/reject-user",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  if (!userId) {
    return NextResponse.redirect(new URL("/sign-up", req.url));
  }

  const metadata =
    (sessionClaims?.metadata as {
      approved?: boolean;
      role?: string;
    }) ||
    (sessionClaims?.publicMetadata as {
      approved?: boolean;
      role?: string;
    }) ||
    {};

  const approved = metadata.approved === true;
  const role = metadata.role;

  if (!approved && role !== "admin") {
    return NextResponse.redirect(new URL("/pending", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};