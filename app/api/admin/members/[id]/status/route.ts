import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-server";
import { isMemberStatus } from "@/lib/roles";
import { buildApprovalEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";

/**
 * Change a member's approval status.
 *
 * This is the ONLY path that may write profiles.status. It requires an
 * authenticated admin and uses the service-role client; the database trigger
 * in migration-connect.sql rejects status writes from member sessions.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getServiceSupabase();
  if (!supabase) return NextResponse.json({ error: "DB not configured" }, { status: 500 });

  const { id } = await params;
  const body = await request.json();
  const status = body.status;

  if (!isMemberStatus(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 422 });
  }

  const reason =
    typeof body.reason === "string"
      ? body.reason.replace(/[<>]/g, "").trim().slice(0, 500) || null
      : null;

  const { data, error } = await supabase
    .from("profiles")
    .update({
      status,
      rejection_reason: status === "rejected" ? reason : null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[admin/members/status] update failed", {
      code: error.code,
      message: error.message,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (status === "approved") {
    await notifyApproved(supabase, id, data.full_name);
  }

  return NextResponse.json({ data });
}

/** Best-effort approval email. Silently skipped when Resend isn't configured. */
async function notifyApproved(
  supabase: ReturnType<typeof getServiceSupabase>,
  userId: string,
  fullName: string
) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey || !supabase) return;

  try {
    const { data: u } = await supabase.auth.admin.getUserById(userId);
    const email = u?.user?.email;
    if (!email) return;

    // Multipart: html when the template loads, text always. A message with
    // both parts fares better with spam filters than HTML alone, and if the
    // template cannot be read the member still gets a readable email.
    const { subject, html, text } = await buildApprovalEmail(
      fullName,
      `${SITE_URL}/connect/directory`
    );

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Crescent Connect <noreply@crescentglobal.org>",
        to: email,
        subject,
        ...(html ? { html } : {}),
        text,
      }),
    });
    if (!res.ok) {
      console.error("[admin/members/status] Resend failed", await res.text());
    }
  } catch (e) {
    // Never fail the approval because the email didn't send.
    console.error("[admin/members/status] Resend threw", e);
  }
}
