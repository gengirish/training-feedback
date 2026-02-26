import { NextRequest, NextResponse } from "next/server";
import { addParticipant, getParticipants } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin";

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

    addParticipant({
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
    const participants = getParticipants();
    return NextResponse.json(participants);
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch participants" }, { status: 500 });
  }
}
