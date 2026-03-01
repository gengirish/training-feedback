import { NextRequest, NextResponse } from "next/server";
import { addParticipant, getParticipants, trackEvent } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { full_name, email, training_session } = body;
    if (!full_name || !email || !training_session) {
      return NextResponse.json(
        { error: "Name, email, and training session are required" },
        { status: 400 }
      );
    }

    const rl = checkRateLimit(`reg:${email}`, 10, 60);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Too many registrations. Try again in ${rl.resetInSeconds}s.` },
        { status: 429, headers: { "Retry-After": String(rl.resetInSeconds) } },
      );
    }

    await addParticipant({
      full_name: body.full_name,
      email: body.email,
      phone: body.phone || null,
      organization: body.organization || null,
      job_title: body.job_title || null,
      experience_level: body.experience_level || null,
      training_session: body.training_session,
      expectations: body.expectations || null,
      referral_source: body.referral_source || null,
    });

    trackEvent(email, "registration_created", { training_session });

    return NextResponse.json({ success: true, message: "Registration successful!" });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const participants = await getParticipants();
    return NextResponse.json(participants);
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch participants" }, { status: 500 });
  }
}
