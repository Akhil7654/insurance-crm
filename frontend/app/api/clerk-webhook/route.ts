import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  if (body.type !== "user.created") {
    return NextResponse.json({ ok: true });
  }

  const user = body.data;
  const userId = user.id;

  const email = user.email_addresses?.[0]?.email_address;
  const ownerEmail = process.env.OWNER_EMAIL;

  const clerk = await clerkClient();

  if (email === ownerEmail) {
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        approved: true,
        role: "admin",
      },
    });

    return NextResponse.json({ ok: true, message: "Owner auto-approved" });
  }

  await clerk.users.updateUserMetadata(userId, {
    publicMetadata: {
      approved: false,
      role: "user",
    },
  });

  console.log("New user waiting for approval:", email);
  console.log(
    `Approve link: ${process.env.NEXT_PUBLIC_APP_URL}/api/approve-user?userId=${userId}&secret=${process.env.APPROVAL_SECRET}`
  );

  return NextResponse.json({ ok: true });
}