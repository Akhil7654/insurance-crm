import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  if (!userId || !secret) {
    return new NextResponse("Missing userId or secret", { status: 400 });
  }

  if (secret !== process.env.APPROVAL_SECRET) {
    return new NextResponse("Invalid approval secret", { status: 403 });
  }

  const clerk = await clerkClient();

  await clerk.users.updateUserMetadata(userId, {
    publicMetadata: {
      approved: true,
      role: "user",
    },
  });

  return new NextResponse("User approved successfully. They can now enter the CRM.");
}