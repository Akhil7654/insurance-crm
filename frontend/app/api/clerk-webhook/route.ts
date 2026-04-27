import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.type !== "user.created") {
      return NextResponse.json({ ok: true });
    }

    const user = body.data;
    const userId = user.id;

    const email = user.email_addresses?.[0]?.email_address || "";
    const firstName = user.first_name || "";
    const lastName = user.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim() || "New user";

    const ownerEmail = process.env.OWNER_EMAIL;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const approvalSecret = process.env.APPROVAL_SECRET;

    const clerk = await clerkClient();

    // ✅ Owner auto-approved
    if (email === ownerEmail) {
      await clerk.users.updateUserMetadata(userId, {
        publicMetadata: {
          approved: true,
          role: "admin",
        },
      });

      return NextResponse.json({
        ok: true,
        message: "Owner auto-approved",
      });
    }

    // ✅ Normal user → pending
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        approved: false,
        role: "user",
      },
    });

    // ✅ Links
    const approveLink = `${appUrl}/api/approve-user?userId=${userId}&secret=${approvalSecret}`;
    const rejectLink = `${appUrl}/api/reject-user?userId=${userId}&secret=${approvalSecret}`;

    // ✅ Send email
    const { error } = await resend.emails.send({
      from:
        process.env.RESEND_FROM ||
        "Insurance CRM <onboarding@resend.dev>",
      to: [ownerEmail!],
      subject: "New CRM user waiting for approval",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>New CRM Signup Request</h2>

          <p>A new user has signed up and is waiting for approval.</p>

          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>

          <p>
            <a 
              href="${approveLink}" 
              style="background:#111;color:#fff;padding:12px 18px;text-decoration:none;border-radius:6px;display:inline-block;margin-right:10px;"
            >
              Approve User
            </a>

            <a 
              href="${rejectLink}" 
              style="background:#b91c1c;color:#fff;padding:12px 18px;text-decoration:none;border-radius:6px;display:inline-block;"
            >
              Reject User
            </a>
          </p>

          <p><strong>Approve link:</strong></p>
          <p>${approveLink}</p>

          <p><strong>Reject link:</strong></p>
          <p>${rejectLink}</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend email error:", error);
      return NextResponse.json(
        { ok: false, error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Approval email sent",
    });
  } catch (error) {
    console.error("Webhook error:", error);

    return NextResponse.json(
      { ok: false, error: "Webhook failed" },
      { status: 500 }
    );
  }
}